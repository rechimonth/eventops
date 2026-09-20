import express, { Request, Response, NextFunction } from 'express';

// EventOps AI/ops backend (Node ligero). Endurecido sin dependencias extra:
// - body 10kb, timeout 15s, rate-limit en memoria, CORS allowlist para la landing
// - /ai/* exige JWT de Supabase (el móvil lo manda como Bearer)
// - /rsvp es público por diseño (capability = slug), con rate-limit propio
// - errores 500 genéricos: nunca stack ni mensajes internos

const {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
  GROQ_API_KEY, GROQ_MODEL, LANDING_ORIGIN, PORT,
} = process.env;

for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY })) {
  if (!v) {
    console.error(`[boot] falta ${k}: el servidor no arranca sin Supabase.`);
    process.exit(1);
  }
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// Timeout por request: un Groq caído no cuelga el proceso.
app.use((_req: Request, res: Response, next: NextFunction) => {
  const t = setTimeout(() => {
    if (!res.headersSent) res.status(503).json({ error: 'timeout' });
  }, 15000);
  res.on('finish', () => clearTimeout(t));
  next();
});

// CORS solo para la landing pública (el móvil/RN no necesita CORS).
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowed = (LANDING_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  if (req.method === 'OPTIONS') return void res.sendStatus(204);
  next();
});

// Rate-limit en memoria: 10 req/min por IP en /ai/*, 20 en /rsvp.
const buckets = new Map<string, number[]>();
function limiter(maxPerMin: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const hits = (buckets.get(key) ?? []).filter((t) => now - t < 60000);
    if (hits.length >= maxPerMin) return void res.status(429).json({ error: 'rate_limited' });
    hits.push(now);
    buckets.set(key, hits);
    next();
  };
}

// Auth: JWT de Supabase como Bearer. 401 sin PII ni detalles.
async function requireUser(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return void res.status(401).json({ error: 'unauthorized' });
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const anon = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { data, error } = await anon.auth.getUser(token);
    if (error || !data.user) return void res.status(401).json({ error: 'unauthorized' });
    res.locals.userId = data.user.id;
    next();
  } catch {
    return void res.status(401).json({ error: 'unauthorized' });
  }
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function llm(prompt: string, input: string): Promise<string> {
  if (!GROQ_API_KEY || !GROQ_MODEL) throw new Error('AI_NO_CONFIG');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'system', content: prompt }, { role: 'user', content: input }], temperature: 0.6 }),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`AI_UPSTREAM_${r.status}`);
    const j = await r.json();
    const text = j.choices?.[0]?.message?.content;
    if (!text) throw new Error('AI_EMPTY');
    return text;
  } finally {
    clearTimeout(t);
  }
}

// Boundary Manager: 3 respuestas diplomáticas pero firmes.
app.post('/ai/boundary', limiter(10), requireUser, async (req: Request, res: Response) => {
  try {
    const out = await llm(
      'Eres un mediador diplomático de bodas. Devuelve 3 opciones cortas (firme, cálida, neutra) para poner límites sin conflicto.',
      String(req.body.input ?? '').slice(0, 2000)
    );
    res.json({ options: out });
  } catch {
    res.status(502).json({ error: 'IA no disponible' });
  }
});

// Scraper: PROVISORIO y honesto (sin rangos inventados). Devuelve pista
// real cuando puede; el front lo muestra como "provisional".
app.post('/ai/scraper', limiter(10), requireUser, async (req: Request, res: Response) => {
  const uas = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (Linux; Android 14)'];
  const ua = uas[Math.floor(Math.random() * uas.length)];
  const q = String(req.body.query ?? '').slice(0, 200);
  try {
    const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q + ' precio casamiento')}&format=json`, { headers: { 'User-Agent': ua } });
    const j = await r.json();
    res.json({ query: q, hint: String(j.AbstractText ?? '').slice(0, 200) || 'usar Casamientos.com.ar/Zankyou para detalle', provisional: true });
  } catch {
    res.json({ query: q, hint: '', provisional: true });
  }
});

// WhatsApp Ops: SOLO cuenta pendientes (sin PII en la respuesta).
// El envío real (Twilio/Meta, plantilla + opt-out) va cuando haya credenciales.
app.post('/ai/rsvp-chase', limiter(10), requireUser, async (req: Request, res: Response) => {
  const eventId = String(req.body.eventId ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return void res.status(400).json({ error: 'eventId inválido' });
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { count, error } = await sb.from('guests').select('id', { count: 'exact', head: true })
      .eq('event_id', eventId).eq('rsvp_status', 'pending').eq('is_deleted', false);
    if (error) throw error;
    res.json({ eventId, pending: count ?? 0, sent: 0 });
  } catch {
    res.status(500).json({ error: 'internal' });
  }
});

// RSVP inbound: solo con slug de invitación (nunca por teléfono).
app.post('/rsvp', limiter(20), async (req: Request, res: Response) => {
  const { slug, status, dietary } = req.body as { slug?: string; status?: string; dietary?: string };
  if (!slug || typeof slug !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(slug)) {
    return res.status(400).json({ ok: false, error: 'slug inválido' });
  }
  if (status !== undefined && status !== 'confirmed' && status !== 'declined') {
    return res.status(400).json({ ok: false, error: 'status inválido' });
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const diet = String(dietary ?? '').slice(0, 200);
    const { data, error } = await sb
      .from('guests')
      .update({ rsvp_status: status ?? 'confirmed', dietary: diet, last_write_at: new Date().toISOString() })
      .eq('invite_slug', slug)
      .eq('is_deleted', false)
      .select('id');
    if (error) throw error;
    if (!data?.length) return void res.status(404).json({ ok: false });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Webhook Mercado Pago: secreto + anti-replay genérico (x-request-id único 10 min).
// TODO: migrar a HMAC-SHA256 según formato vigente de MP antes de activar en prod.
const seenWebhooks = new Map<string, number>();
app.post('/webhooks/mercadopago', (req: Request, res: Response) => {
  const sig = req.headers['x-signature'];
  const rid = req.headers['x-request-id'];
  if (!sig || sig !== process.env.MERCADOPAGO_WEBHOOK_SECRET) return void res.status(401).json({ ok: false });
  if (!rid || typeof rid !== 'string') return void res.status(400).json({ ok: false });
  const now = Date.now();
  for (const [k, t] of seenWebhooks) if (now - t > 10 * 60 * 1000) seenWebhooks.delete(k);
  if (seenWebhooks.has(rid)) return void res.status(401).json({ ok: false });
  seenWebhooks.set(rid, now);
  // TODO: mapear req.body.data.id -> pago -> guests/invite_slug o budget_items(regalo)
  res.json({ ok: true });
});

// Handler final: nunca stack ni mensajes internos.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api]', err instanceof Error ? err.message : err);
  if (!res.headersSent) res.status(500).json({ error: 'internal' });
});

app.listen(Number(PORT ?? 8787), () => console.log('AI ops listo'));
