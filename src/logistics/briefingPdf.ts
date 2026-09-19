import * as Print from 'expo-print';
import { buildBriefing, Briefing } from '../logistics/briefing';

// Briefing PDF desde la app (Cotizador Inverso) para enviar masivamente.
export async function printBriefingPDF(b: Briefing) {
  const { text, link } = buildBriefing(b);
  const html = `<html><body style="font-family:monospace;padding:24px">
<h1>Briefing proveedor — ${b.event}</h1><pre>${text}</pre><p>Link: ${link}</p></body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
