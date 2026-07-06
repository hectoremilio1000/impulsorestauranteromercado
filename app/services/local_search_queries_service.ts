const CATEGORY_PHRASES: Record<string, string[]> = {
  restaurant: ['restaurante'],
  bar: ['bar'],
  cafe: ['café'],
  bakery: ['panadería'],
  meal_takeaway: ['comida para llevar'],
  meal_delivery: ['comida a domicilio'],
  night_club: ['antro'],
}

// Google Place Types incluye subtipos de cocina para algunos negocios (si el
// dueño los configuró así en su Perfil de Google Business). Cuando están
// presentes son la señal más confiable de tipo de cocina.
const CUISINE_TYPE_PHRASES: Record<string, string> = {
  mexican_restaurant: 'comida mexicana',
  italian_restaurant: 'comida italiana',
  chinese_restaurant: 'comida china',
  japanese_restaurant: 'comida japonesa',
  sushi_restaurant: 'sushi',
  thai_restaurant: 'comida tailandesa',
  indian_restaurant: 'comida india',
  french_restaurant: 'comida francesa',
  spanish_restaurant: 'comida española',
  mediterranean_restaurant: 'comida mediterránea',
  greek_restaurant: 'comida griega',
  korean_restaurant: 'comida coreana',
  vietnamese_restaurant: 'comida vietnamita',
  seafood_restaurant: 'mariscos',
  steak_house: 'carnes asadas',
  pizza_restaurant: 'pizza',
  hamburger_restaurant: 'hamburguesas',
  breakfast_restaurant: 'desayunos',
  brunch_restaurant: 'brunch',
  vegetarian_restaurant: 'comida vegetariana',
  vegan_restaurant: 'comida vegana',
  fast_food_restaurant: 'comida rápida',
  barbecue_restaurant: 'barbacoa',
}

// Muchos negocios en México sólo traen el `types` genérico ("restaurant")
// sin subtipo de cocina en Google. Como respaldo, inferimos del nombre del
// negocio mismo (no de una descripción: Places no expone una de forma
// confiable) buscando palabras que delatan el tipo de comida.
const NAME_KEYWORD_PHRASES: Array<{ pattern: RegExp; phrase: string }> = [
  { pattern: /taquer|tacos?\b/, phrase: 'tacos' },
  { pattern: /birria/, phrase: 'birria' },
  { pattern: /sushi/, phrase: 'sushi' },
  { pattern: /pizzer|pizza/, phrase: 'pizza' },
  { pattern: /marisc/, phrase: 'mariscos' },
  { pattern: /asador|parrilla|carnes/, phrase: 'carnes asadas' },
  { pattern: /cantina/, phrase: 'cantina' },
  { pattern: /panader/, phrase: 'panadería' },
  { pattern: /cafeter|café|cafe\b/, phrase: 'café' },
  { pattern: /hamburgues/, phrase: 'hamburguesas' },
  { pattern: /pollo/, phrase: 'pollo' },
  { pattern: /trattoria|italian/, phrase: 'comida italiana' },
]

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function parseAddressParts(formattedAddress: string | null): {
  colonia: string | null
  city: string | null
  firstCandidate: string | null
} {
  if (!formattedAddress) return { colonia: null, city: null, firstCandidate: null }

  const parts = formattedAddress
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part) && !/^[A-Z]{2}$/.test(part))

  // El último segmento suele ser el país; lo descartamos.
  const candidates = parts.slice(0, -1)

  // candidates[1] suele ser la colonia (ej. "Las Fuentes") y candidates[2]
  // trae el CP pegado a la ciudad (ej. "88710 Reynosa").
  const colonia = candidates[1] ?? null
  const cityRaw = candidates[2] ?? null
  const city = cityRaw ? cityRaw.replace(/^\d{4,6}\s*/, '').trim() || null : null

  return { colonia, city, firstCandidate: candidates[0] ?? null }
}

function deriveZone(formattedAddress: string | null): string | null {
  const { colonia, city, firstCandidate } = parseAddressParts(formattedAddress)

  // La zona "colonia, ciudad" es clave para que la búsqueda simulada dé
  // resultados locales relevantes (probado: "mejor restaurante en Las
  // Fuentes" da resultados distintos a "mejor restaurante en Las Fuentes,
  // Reynosa").
  if (colonia && city && colonia.toLowerCase() !== city.toLowerCase()) {
    return `${colonia}, ${city}`
  }

  return colonia ?? city ?? firstCandidate
}

// Colonia (o ciudad si no hay colonia), para las frases cortas de volumen
// de búsqueda — ver buildVolumeQueries(). OJO: en direcciones de Ciudad de
// México, candidates[2] (lo que usamos como "city" en parseAddressParts) es
// en realidad la ALCALDÍA (ej. "Cuauhtémoc"), no una ciudad — y una
// alcaldía cubre muchas colonias distintas (Condesa, Hipódromo, Roma...).
// Confirmado con un caso real: dos negocios en colonias distintas pero la
// misma alcaldía terminaban generando la MISMA frase corta ("bar
// Cuauhtémoc") y por lo tanto el mismo volumen/posición/pérdida estimada,
// aunque fueran negocios genuinamente distintos. Preferir la colonia evita
// este falso empate.
function deriveVolumeZone(formattedAddress: string | null): string | null {
  const { colonia, city, firstCandidate } = parseAddressParts(formattedAddress)
  const zone = colonia ?? city ?? firstCandidate
  // La gente no dice "bar Colonia Condesa", dice "bar Condesa" — Google le
  // pega el prefijo genérico "Colonia"/"Col." al nombre de la colonia en el
  // formatted_address, y eso puede evitar que la frase coincida con cómo
  // Google Ads tiene registrado el volumen real de búsqueda.
  return zone ? zone.replace(/^col(?:onia)?\.?\s+/i, '').trim() || zone : zone
}

/**
 * Intenta inferir el tipo de cocina/especialidad del negocio: primero desde
 * los subtipos de Google Place Types (más confiable si el dueño los
 * configuró), y si no hay ninguno, desde palabras clave en el nombre del
 * negocio (ej. "Tacos", "Sushi", "Pizzería").
 */
function inferCuisinePhrase(name: string, types: string[]): string | null {
  for (const type of types) {
    if (CUISINE_TYPE_PHRASES[type]) return CUISINE_TYPE_PHRASES[type]
  }

  const normalizedName = normalize(name)
  for (const { pattern, phrase } of NAME_KEYWORD_PHRASES) {
    if (pattern.test(normalizedName)) return phrase
  }

  return null
}

// Plantillas de frase — combinadas con cada término (cocina/categoría/casual)
// para cubrir varias formas reales en que la gente busca en Google.
const QUERY_TEMPLATES: Array<(term: string, zone: string) => string> = [
  (term, zone) => `mejor ${term} en ${zone}`,
  (term, zone) => `${term} cerca de ${zone}`,
  (term, zone) => `${term} en ${zone}`,
]

/**
 * Arma frases de búsqueda locales realistas combinando distintos términos
 * (tipo de cocina inferido, categoría general del negocio, y un término
 * casual como "comida") con distintas plantillas de frase, sobre la zona
 * (colonia/ciudad extraída de formatted_address). Hasta 9 combinaciones,
 * para cubrir varios ángulos de búsqueda por reporte (como hace Owner).
 */
export function buildLocalSearchQueries(details: {
  name: string
  types: string[]
  formatted_address: string | null
}): string[] {
  const zone = deriveZone(details.formatted_address)
  if (!zone) return []

  const categoryPhrases = details.types.flatMap((type) => CATEGORY_PHRASES[type] ?? [])
  const genericPhrase = categoryPhrases[0] ?? 'restaurante'
  const cuisinePhrase = inferCuisinePhrase(details.name, details.types)

  const terms = Array.from(new Set([cuisinePhrase, genericPhrase, 'comida'].filter(Boolean)))

  const queries = QUERY_TEMPLATES.flatMap((template) =>
    terms.map((term) => template(term as string, zone))
  )

  return Array.from(new Set(queries)).slice(0, 9)
}

// Plantillas cortas — sin "en"/"cerca de" (esas preposiciones + zona
// completa reducen las probabilidades de que Google Ads tenga volumen
// registrado para la frase exacta).
const VOLUME_QUERY_TEMPLATES: Array<(term: string, zone: string) => string> = [
  (term, zone) => `${term} ${zone}`,
  (term, zone) => `mejor ${term} ${zone}`,
]

/**
 * Frases CORTAS (término + sólo colonia/ciudad, sin "en"/"cerca de") para el
 * cálculo de pérdida de ventas: a diferencia de las 9 frases hiperlocales de
 * buildLocalSearchQueries (buenas para medir posición real, pero DEMASIADO
 * específicas para tener volumen de búsqueda medible en Google Ads —
 * confirmado probando la API real: "mejor cantina en Hipódromo, Cuauhtémoc"
 * da volumen null, pero "cantina condesa" da 480), estas frases cortas sí
 * tienen más chance de tener volumen real y se usan tanto para medir
 * posición como volumen de la MISMA frase.
 *
 * Se generan varias combinaciones (hasta 3 términos x 2 formas = 6) en vez
 * de sólo 1-2, porque en la práctica muchas de estas frases individuales NO
 * tienen dato en Google Ads (colonias chicas, palabras poco buscadas) — con
 * más frases hay más oportunidades de que al menos varias sí tengan datos
 * reales, en vez de que el cálculo dependa de una sola coincidencia.
 */
export function buildVolumeQueries(details: {
  name: string
  types: string[]
  formatted_address: string | null
}): string[] {
  const zone = deriveVolumeZone(details.formatted_address)
  if (!zone) return []

  const categoryPhrases = details.types.flatMap((type) => CATEGORY_PHRASES[type] ?? [])
  const genericPhrase = categoryPhrases[0] ?? 'restaurante'
  const cuisinePhrase = inferCuisinePhrase(details.name, details.types)

  const terms = Array.from(new Set([cuisinePhrase, genericPhrase, 'comida'].filter(Boolean)))

  const queries = VOLUME_QUERY_TEMPLATES.flatMap((template) =>
    terms.map((term) => template(term as string, zone))
  )

  return Array.from(new Set(queries)).slice(0, 6)
}
