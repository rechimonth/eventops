import { useState } from 'react';

// FASE 5 + FASE 8: hooks a microservicios IA con fallback offline.
// Sin keys/backend: respuestas quemadas tras 2s para desarrollar la UI.
const API = process.env.EXPO_PUBLIC_AI_API ?? '';
const MOCK_AI = (process.env.EXPO_PUBLIC_USE_MOCKS ?? 'false').toLowerCase() === 'true';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const FALLBACK = {
  boundary: (input: string) => ({
    options: [
      `Firme: "Gracias por tu mensaje. Ya decidimos: ${input.slice(0, 40)}… no habrá cambios."`,
      `Cálida: "¡Te queremos! Por logística no podemos sumar más, pero te guardamos un lugar especial en la fiesta."`,
      `Neutra: "Anotado. Lo evaluamos con el/la planner y te confirmamos por este medio."`,
    ],
  }),
  scraper: (query: string) => ({ query, avgRange: 'USD 400-1200', source: 'mock offline' }),
  rsvpChase: (eventId: string) => ({ eventId, chased: 9, note: 'mock: 9 pendientes con recordatorio programado' }),
};

async function post(path: string, body: any) {
  if (!API || MOCK_AI) {
    await wait(2000);
    if (path === '/ai/boundary') return FALLBACK.boundary(String(body.input ?? ''));
    if (path === '/ai/scraper') return FALLBACK.scraper(String(body.query ?? ''));
    return FALLBACK.rsvpChase(String(body.eventId ?? ''));
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) throw new Error(`AI ${path}: ${r.status}`);
    return r.json();
  } catch {
    await wait(2000); // red inestable => fallback quemado, la UI sigue viva
    if (path === '/ai/boundary') return FALLBACK.boundary(String(body.input ?? ''));
    if (path === '/ai/scraper') return FALLBACK.scraper(String(body.query ?? ''));
    return FALLBACK.rsvpChase(String(body.eventId ?? ''));
  }
}

export function useAIAgents() {
  const [loading, setLoading] = useState(false);

  const boundary = async (input: string) => {
    setLoading(true);
    try { return await post('/ai/boundary', { input }); }
    finally { setLoading(false); }
  };
  const scraper = async (query: string) => {
    setLoading(true);
    try { return await post('/ai/scraper', { query }); }
    finally { setLoading(false); }
  };
  const rsvpChase = async (eventId: string) => {
    setLoading(true);
    try { return await post('/ai/rsvp-chase', { eventId }); }
    finally { setLoading(false); }
  };
  return { loading, boundary, scraper, rsvpChase };
}
