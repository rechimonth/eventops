// Landing de invitación estilo Vincenzo Donato: countdown, mapa, dress code,
// CBU/Alias, botón RSVP -> Supabase, subida de fotos a álbum compartido.
// Se sirve desde Next.js/Vercel o Supabase Edge; la app genera la URL única.

export function inviteUrl(base: string, slug: string) {
  return `${base.replace(/\/$/, '')}/${slug}`;
}

// Todo texto de terceros se escapa (XSS en origen público); las URLs
// solo https (bloquea javascript:); dateISO debe ser ISO 8601.
export function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function safeHttpsUrl(u: string) {
  try {
    const p = new URL(u);
    return p.protocol === 'https:' ? u : '#';
  } catch {
    return '#';
  }
}

export function landingHtml(opts: {
  couple: string; dateISO: string; venue: string; mapsUrl: string;
  dressCode: string; cbu: string; alias: string; rsvpEndpoint: string; slug: string;
}) {
  const raw = opts;
  const couple = escapeHtml(raw.couple);
  const venue = escapeHtml(raw.venue);
  const dressCode = escapeHtml(raw.dressCode);
  const cbu = escapeHtml(raw.cbu);
  const alias = escapeHtml(raw.alias);
  const slug = escapeHtml(raw.slug);
  const mapsUrl = safeHttpsUrl(raw.mapsUrl);
  const rsvpEndpoint = safeHttpsUrl(raw.rsvpEndpoint);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw.dateISO)) throw new RangeError('dateISO inválida (ISO 8601)');
  const dateISO = raw.dateISO;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${couple} — Te invitamos</title>
<style>body{font-family:Georgia,serif;background:#FFF9F5;color:#3D2C2C;text-align:center;margin:0}
.hero{padding:48px 20px}.count{font-size:28px;letter-spacing:2px}.card{background:#fff;margin:16px auto;max-width:520px;padding:20px;border-radius:12px;box-shadow:0 2px 12px #0001}
.btn{display:inline-block;background:#2B7FFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:6px}</style>
</head><body><div class="hero"><h1>${couple}</h1><p>${venue}</p>
<p class="count" id="cd">…</p></div>
<div class="card"><h3>Vestimenta</h3><p>${dressCode}</p>
<h3>Cómo llegar</h3><a class="btn" href="${mapsUrl}">Google Maps</a>
<h3>Regalos</h3><p>CBU ${cbu}<br/>Alias ${alias}</p>
<div id="mp"></div>
<h3>Confirmar asistencia</h3>
<button class="btn" onclick="rsvp('confirmed')">Voy 🙌</button>
<button class="btn" style="background:#888" onclick="rsvp('declined')">No puedo 😢</button>
<p><input id="diet" placeholder="Alergias / dieta (ej. celíaco)" style="padding:8px;width:80%"/></p>
<h3>Álbum compartido</h3><input type="file" accept="image/*" onchange="up(this)"/></div>
<script>const T=new Date("${dateISO}").getTime();
setInterval(()=>{const d=T-Date.now();if(d<0){cd.textContent="¡Hoy es el día!";return}
const h=Math.floor(d/36e5),m=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);
cd.textContent=Math.floor(h/24)+"d "+(h%24)+"h "+m+"m "+s+"s"},1000);
async function rsvp(st){const r=await fetch("${rsvpEndpoint}",{method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({slug:"${slug}",status:st,dietary:document.getElementById("diet").value})});alert(r.ok?"¡Gracias!":"No se pudo confirmar, reintenta")}
async function up(i){alert("Foto lista para subir: "+i.files[0].name+" (conectar Supabase Storage)")}</script>
</body></html>`;
}
