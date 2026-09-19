// Cotizador Inverso: Briefing estandarizado para enviar masivamente a proveedores.
// Genera objeto listo para PDF (expo-print) o link compartible.

export interface Briefing {
  event: string; date: string; venue: string; guests: number;
  maxBudget: number; requirements: string; contact: string;
}

export function buildBriefing(b: Briefing) {
  const lines = [
    `EVENTO: ${b.event} — ${b.date} — ${b.venue} (${b.guests} invitados)`,
    `PRESUPUESTO MÁXIMO: $${b.maxBudget} (responder SOLO si se ajusta)`,
    `REQUERIMIENTOS: ${b.requirements}`,
    `CONTACTO: ${b.contact}`,
    `SSOT: cualquier cambio de fecha/invitados se notifica por email automáticamente.`,
  ];
  const text = lines.join('\n');
  const link = `https://mi-boda.eventops.app/briefing?e=${encodeURIComponent(b.event)}&d=${encodeURIComponent(b.date)}&g=${b.guests}&b=${b.maxBudget}`;
  return { text, link };
}
