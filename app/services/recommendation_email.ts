/**
 * Construye el correo HTML de recomendaciones de la encuesta, con la marca de
 * Impulso Restaurantero. Convierte el Markdown que devuelve la IA a HTML (antes
 * se enviaba como <pre> crudo) y lo envuelve en una plantilla: encabezado,
 * recap del perfil, recomendación formateada, CTA y pie.
 *
 * Sin dependencias externas: un conversor Markdown->HTML acotado al subconjunto
 * que produce la IA (encabezados, negritas, listas con viñeta y numeradas).
 */

const AGENDAR_URL = 'https://impulsorestaurantero.com/contacto'
const WHATSAPP_URL =
  'https://wa.me/5215531491808?text=Hola%20vi%20mi%20diagn%C3%B3stico%20y%20quiero%20que%20Impulso%20me%20ayude'

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Aplica formato inline seguro (negritas) sobre texto ya escapado. */
function inline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

/** Conversor Markdown -> HTML acotado (encabezados, listas, negritas, párrafos). */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`)
      listType = null
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      closeList()
      continue
    }

    let m: RegExpMatchArray | null
    if ((m = line.match(/^#{3,6}\s+(.*)$/))) {
      closeList()
      out.push(`<h3 class="rh3">${inline(m[1])}</h3>`)
    } else if ((m = line.match(/^#{1,2}\s+(.*)$/))) {
      closeList()
      out.push(`<h2 class="rh2">${inline(m[1])}</h2>`)
    } else if ((m = line.match(/^\d+\.\s+(.*)$/))) {
      if (listType !== 'ol') {
        closeList()
        out.push('<ol class="rlist">')
        listType = 'ol'
      }
      out.push(`<li>${inline(m[1])}</li>`)
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      if (listType !== 'ul') {
        closeList()
        out.push('<ul class="rlist">')
        listType = 'ul'
      }
      out.push(`<li>${inline(m[1])}</li>`)
    } else {
      closeList()
      out.push(`<p>${inline(line)}</p>`)
    }
  }
  closeList()
  return out.join('\n')
}

/** Extrae [{pregunta, respuesta}] del texto "Pregunta: X\nRespuestas: Y". */
function parsePerfil(respuestasTexto: string): Array<{ pregunta: string; respuesta: string }> {
  return respuestasTexto
    .split(/\n\s*\n/)
    .map((block) => {
      const pregunta = block.match(/Pregunta:\s*(.+)/)?.[1]?.trim()
      const respuesta = block.match(/Respuestas:\s*(.+)/)?.[1]?.trim()
      return pregunta && respuesta ? { pregunta, respuesta } : null
    })
    .filter((x): x is { pregunta: string; respuesta: string } => x !== null)
}

export interface RecommendationEmailInput {
  firstName: string
  respuestasTexto: string
  recomendacionesMarkdown: string
}

export function buildRecommendationEmailHtml({
  firstName,
  respuestasTexto,
  recomendacionesMarkdown,
}: RecommendationEmailInput): string {
  const nombre = escapeHtml(firstName || 'Prospecto')
  const recoHtml = markdownToHtml(recomendacionesMarkdown)
  const perfil = parsePerfil(respuestasTexto)

  const perfilHtml = perfil.length
    ? `<p class="label">Tus respuestas</p>
       <div class="profile"><dl>${perfil
         .map(
           (p) =>
             `<div class="prow"><dt>${escapeHtml(p.pregunta)}</dt><dd>${escapeHtml(
               p.respuesta
             )}</dd></div>`
         )
         .join('')}</dl></div>`
    : ''

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; background:#e9eaed; font-family:-apple-system,"Helvetica Neue",Arial,sans-serif; color:#23231f; }
  .email { max-width:600px; margin:0 auto; background:#fff; }
  .head { background:#0e1116; padding:30px 34px 26px; color:#fff; }
  .wordmark { font-size:18px; font-weight:800; letter-spacing:.02em; }
  .wordmark .g { color:#e7c65a; }
  .head h1 { font-family:Georgia,serif; font-weight:700; font-size:24px; line-height:1.25; margin:16px 0 0; color:#fff; }
  .head .sub { margin:9px 0 0; color:#c9cbd0; font-size:14px; line-height:1.5; }
  .body { padding:28px 34px 6px; }
  .lede { font-size:15.5px; line-height:1.6; margin:0 0 22px; }
  .label { font-size:11px; font-weight:700; letter-spacing:.13em; text-transform:uppercase; color:#9c7c22; margin:0 0 12px; }
  .profile { background:#faf7ef; border:1px solid #ece7db; border-radius:12px; padding:8px 18px; margin:0 0 26px; }
  .profile dl { margin:0; }
  .prow { display:flex; justify-content:space-between; gap:16px; font-size:13.5px; padding:10px 0; border-bottom:1px solid #ece7db; }
  .prow:last-child { border-bottom:0; }
  .prow dt { color:#6f6b5f; }
  .prow dd { margin:0; font-weight:700; text-align:right; }
  .reco h2.rh2 { font-family:Georgia,serif; font-size:20px; margin:26px 0 12px; color:#1b1b1b; }
  .reco h3.rh3 { font-family:Georgia,serif; font-size:17px; margin:22px 0 10px; color:#1b1b1b; }
  .reco p { font-size:14.5px; line-height:1.62; margin:0 0 12px; color:#34342d; }
  .reco ul.rlist, .reco ol.rlist { margin:0 0 14px; padding-left:0; list-style:none; }
  .reco ul.rlist li, .reco ol.rlist li { font-size:14px; line-height:1.55; margin:0 0 9px; padding:11px 14px; background:#faf7ef; border-left:3px solid #b8912f; border-radius:9px; color:#34342d; }
  .reco strong { color:#1b1b1b; }
  .cta { margin:14px 34px 28px; background:#0e1116; border-radius:14px; padding:26px; text-align:center; color:#fff; }
  .cta h3 { font-family:Georgia,serif; font-size:19px; margin:0 0 6px; color:#fff; }
  .cta p { margin:0 0 18px; color:#c9cbd0; font-size:13.5px; }
  .btn { display:inline-block; text-decoration:none; background:#ecd063; color:#33280a; font-weight:800; font-size:15px; padding:14px 26px; border-radius:12px; }
  .btn.ghost { background:transparent; color:#ecd063; border:1px solid rgba(236,208,99,.5); margin-top:12px; font-size:13.5px; padding:11px 22px; }
  .foot { background:#faf7ef; border-top:1px solid #ece7db; padding:20px 34px; text-align:center; color:#6f6b5f; font-size:12px; line-height:1.6; }
  .foot .g { color:#9c7c22; font-weight:700; }
</style></head>
<body>
  <div class="email">
    <div class="head">
      <div class="wordmark"><span class="g">IMPULSO</span>RESTAURANTERO</div>
      <h1>Tu diagnóstico personalizado, ${nombre}</h1>
      <p class="sub">Analizamos tus respuestas y preparamos un plan a la medida de tu restaurante.</p>
    </div>
    <div class="body">
      <p class="lede">Gracias por contestar, <strong>${nombre}</strong>. Esto es lo que vimos y cómo puedes crecer:</p>
      ${perfilHtml}
      <div class="reco">${recoHtml}</div>
    </div>
    <div class="cta">
      <h3>¿Quieres que lo hagamos contigo?</h3>
      <p>Agenda una llamada gratis y armamos juntos tu plan de crecimiento.</p>
      <a class="btn" href="${AGENDAR_URL}">Agendar mi diagnóstico gratis</a><br>
      <a class="btn ghost" href="${WHATSAPP_URL}">Escríbenos por WhatsApp</a>
    </div>
    <div class="foot">
      <span class="g">Impulso Restaurantero</span><br>
      Tecnología y operación para restaurantes que quieren vender más.<br>
      Recibiste este correo porque contestaste nuestra encuesta.
    </div>
  </div>
</body></html>`
}
