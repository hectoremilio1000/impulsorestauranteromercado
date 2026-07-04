const CATEGORY_PHRASES: Record<string, string[]> = {
  restaurant: ['restaurante'],
  bar: ['bar'],
  cafe: ['café'],
  bakery: ['panadería'],
  meal_takeaway: ['comida para llevar'],
  meal_delivery: ['comida a domicilio'],
  night_club: ['antro'],
}

function deriveZone(formattedAddress: string | null): string | null {
  if (!formattedAddress) return null

  const parts = formattedAddress
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part) && !/^[A-Z]{2}$/.test(part))

  // El último segmento suele ser el país; lo descartamos.
  const candidates = parts.slice(0, -1)

  // candidates[1] suele ser la colonia (ej. "Las Fuentes") y candidates[2]
  // trae el CP pegado a la ciudad (ej. "88710 Reynosa") — la ciudad sola es
  // clave para que la búsqueda simulada dé resultados relevantes (probado:
  // "mejor restaurante en Las Fuentes" da resultados distintos a "mejor
  // restaurante en Las Fuentes, Reynosa").
  const colonia = candidates[1] ?? null
  const cityRaw = candidates[2] ?? null
  const city = cityRaw ? cityRaw.replace(/^\d{4,6}\s*/, '').trim() || null : null

  if (colonia && city && colonia.toLowerCase() !== city.toLowerCase()) {
    return `${colonia}, ${city}`
  }

  return colonia ?? city ?? candidates[0] ?? null
}

/**
 * Arma frases de búsqueda locales realistas combinando la categoría del
 * negocio (de Google Places `types`) con su zona (colonia/ciudad extraída
 * de formatted_address), para checar en qué posición aparece el negocio
 * cuando alguien busca eso en Google.
 */
export function buildLocalSearchQueries(details: {
  name: string
  types: string[]
  formatted_address: string | null
}): string[] {
  const zone = deriveZone(details.formatted_address)
  if (!zone) return []

  const categoryPhrases = details.types.flatMap((type) => CATEGORY_PHRASES[type] ?? [])
  const phrases = categoryPhrases.length > 0 ? categoryPhrases : ['restaurante']

  const queries: string[] = []
  phrases.slice(0, 2).forEach((phrase) => {
    queries.push(`mejor ${phrase} en ${zone}`)
  })
  queries.push(`${phrases[0]} cerca de ${zone}`)

  return Array.from(new Set(queries)).slice(0, 3)
}
