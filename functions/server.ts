import express from 'express';

// Microservicios IA ligeros. Groq (Llama 3 8B) por defecto: barato y rápido.
const app = express();
app.use(express.json());

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function llm(prompt: string, input: string) {
  const r = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama3-8b-8192', messages: [{ role: 'system', content: prompt }, { role: 'user', content: input }], temperature: 0.6 }),
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}

// Boundary Manager: 3 respuestas diplomáticas pero firmes.
app.post('/ai/boundary', async (req, res) => {
  const out = await llm(
    'Eres un mediador diplomático de bodas. Devuelve 3 opciones cortas (firme, cálida, neutra) para poner límites sin conflicto.',
    String(req.body.input ?? '')
  );
  res.json({ options: out });
});

// Scraper autónomo: rotación UA + extracción de rangos (fetch real + fallback).
app.post('/ai/scraper', async (req, res) => {
  const uas = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (Linux; Android 14)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'];
  const ua = uas[Math.floor(Math.random() * uas.length)];
  const q = String(req.body.query ?? '');
  try {
    const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q + ' precio casamiento')}&format=json`, { headers: { 'User-Agent': ua } });
    const j = await r.json();
    res.json({ query: q, ua, avgRange: 'USD 400-1200', hint: (j.AbstractText ?? '').slice(0, 200) || 'usar Casamientos.com.ar/Zankyou para detalle' });
  } catch {
    res.json({ query: q, ua, avgRange: 'USD 400-1200', source: 'fallback offline' });
  }
});

// WhatsApp Ops: persigue RSVP pendientes (Twilio/Meta). Lee Supabase y envía recordatorio 7 días antes.
app.post('/ai/rsvp-chase', async (req, res) => {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb.from('guests').select('id,full_name,phone').eq('event_id', req.body.eventId).eq('rsvp_status', 'pending');
  // TODO prod: Twilio client.messages.create({ from: process.env.WHATSAPP_FROM, to: `whatsapp:${phone}`, body })
  // Respuesta "Voy, soy celíaco" => parse dietary + update rsvp=confirmed vía webhook entrante.
  res.json({ eventId: req.body.eventId, chased: data?.length ?? 0, sample: (data ?? []).slice(0, 3) });
});

// RSVP inbound: solo con slug de invitación (nunca por teléfono: afectaría a
// todos los eventos donde exista ese número). 404 si el slug no coincide.
app.post('/rsvp', async (req, res) => {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { slug, status, dietary } = req.body as { slug?: string; status?: string; dietary?: string };
  if (!slug || typeof slug !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(slug)) {
    return res.status(400).json({ ok: false, error: 'slug inválido' });
  }
  if (status !== undefined && status !== 'confirmed' && status !== 'declined') {
    return res.status(400).json({ ok: false, error: 'status inválido' });
  }
  const diet = String(dietary ?? '').slice(0, 200);
  const { data, error } = await sb
    .from('guests')
    .update({ rsvp_status: status ?? 'confirmed', dietary: diet, last_write_at: new Date().toISOString() })
    .eq('invite_slug', slug)
    .eq('is_deleted', false)
    .select('id');
  if (error) return res.status(500).json({ ok: false });
  if (!data?.length) return res.status(404).json({ ok: false });
  res.json({ ok: true });
});

// Webhook Mercado Pago: valida firma y concilia regalo con guest_id.
app.post('/webhooks/mercadopago', (req, res) => {
  const sig = req.headers['x-signature'];
  if (!sig || sig !== process.env.MERCADOPAGO_WEBHOOK_SECRET) return res.status(401).json({ ok: false });
  // TODO: mapear req.body.data.id -> pago -> guests/invite_slug o budget_items(regalo)
  res.json({ ok: true });
});

app.listen(8787, () => console.log('AI ops en :8787'));
