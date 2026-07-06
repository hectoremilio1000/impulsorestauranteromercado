import axios from 'axios'
import env from '#start/env'

const BASE_URL = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live'

// Google Ads Geo Target ID para México (país completo). El volumen de
// búsqueda de Google Ads no es fino a nivel colonia — usamos país en vez de
// intentar resolver ciudad/colonia dinámicamente (frágil: un nombre de
// ciudad mal formado silenciosamente no matchea nada). El "factor
// conservador" en el cálculo de pérdida compensa por usar esta geografía
// más amplia que la zona real del negocio.
const MEXICO_LOCATION_CODE = 2484

// Google Ads (Keyword Planner) rechaza comas en el texto de la keyword
// (confirmado probando la API real: "mejor cantina en Hipódromo,
// Cuauhtémoc" es inválida, sin la coma sí funciona — los acentos no son el
// problema). Nuestras frases sí usan comas ("colonia, ciudad") para el SERP
// normal de Google (que las acepta sin problema), así que sólo las
// limpiamos para esta consulta específica de volumen.
function sanitizeForGoogleAds(keyword: string): string {
  return keyword.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * Consulta el volumen de búsqueda mensual real (Google Ads) para hasta 1000
 * palabras clave en una sola llamada. Regresa un mapa: la keyword ORIGINAL
 * (tal como se le pasó a la función) -> volumen mensual, o null si Google
 * Ads no tiene dato para esa keyword.
 */
export async function getSearchVolumes(keywords: string[]): Promise<Map<string, number | null>> {
  const resultMap = new Map<string, number | null>()
  if (keywords.length === 0) return resultMap

  // sanitized (lo que le mandamos a Google Ads) -> original (lo que nos
  // pasó el caller), para poder regresar el mapa keyed por la frase real.
  const sanitizedToOriginal = new Map<string, string>()
  const sanitizedKeywords: string[] = []
  for (const keyword of keywords) {
    const sanitized = sanitizeForGoogleAds(keyword)
    if (!sanitized || sanitizedToOriginal.has(sanitized)) continue
    sanitizedToOriginal.set(sanitized, keyword)
    sanitizedKeywords.push(sanitized)
  }

  const { data } = await axios.post(
    BASE_URL,
    [
      {
        location_code: MEXICO_LOCATION_CODE,
        language_code: 'es',
        keywords: sanitizedKeywords,
      },
    ],
    {
      auth: {
        username: env.get('DATAFORSEO_LOGIN'),
        password: env.get('DATAFORSEO_PASSWORD'),
      },
      timeout: 20000,
    }
  )

  const task = data?.tasks?.[0]
  if (task?.status_code && task.status_code !== 20000) {
    throw new Error(
      `DataForSEO keyword volume error: ${task.status_code} ${task.status_message ?? ''}`
    )
  }

  const results = (task?.result ?? []) as any[]
  for (const item of results) {
    const returnedKeyword = String(item?.keyword ?? '').toLowerCase()
    const originalKeyword = sanitizedToOriginal.get(returnedKeyword)
    if (!originalKeyword) continue
    resultMap.set(
      originalKeyword,
      typeof item?.search_volume === 'number' ? item.search_volume : null
    )
  }

  return resultMap
}
