import { findPlaceLocation } from '#services/google_places_service'
import type { LocalRankingResult } from '#services/dataforseo_service'

function normalize(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

type LatLng = { lat: number; lng: number }

type ProximityCompetitor = { name: string; location: LatLng | null }

// Un match de Places con nombre ambiguo (ej. "Tpk VIP") puede resolver a un
// lugar lejano y equivocado. Si cae más lejos que esto de la zona, se descarta
// (no se pinta) para no romper el encuadre del mapa.
const MAX_DISTANCE_KM = 5

function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export type SearchCompetitor = {
  name: string
  rating: number | null
  location: LatLng | null
  appearances: number
  fromProximity: boolean
}

/**
 * Deriva los competidores de BÚSQUEDA (los que rankean en el local pack de
 * DataForSEO) y les resuelve coordenadas para el mapa:
 *   1) reusa las coords de un competidor de PROXIMIDAD que coincida por nombre
 *      (gratis, ya las tenemos), y
 *   2) para los que no coincidan, hace un Google Places "Find Place" por nombre.
 * La keyword ya filtró por concepto, así que NO se aplica filtro extra aquí.
 */
export async function resolveSearchCompetitors(
  serpQueries: LocalRankingResult[],
  proximityCompetitors: ProximityCompetitor[],
  bias: LatLng | null,
  targetName: string,
  limit = 6
): Promise<SearchCompetitor[]> {
  const target = normalize(targetName)
  const byName = new Map<
    string,
    { name: string; rating: number | null; queries: Set<string>; bestPos: number }
  >()

  for (const q of serpQueries ?? []) {
    ;(q.mapPack?.topResults ?? []).forEach((result, idx) => {
      if (!result?.name) return
      const key = normalize(result.name)
      if (!key || key === target) return
      const prev =
        byName.get(key) ||
        { name: result.name, rating: result.rating ?? null, queries: new Set<string>(), bestPos: Infinity }
      prev.queries.add(q.query)
      if (prev.rating == null && result.rating != null) prev.rating = result.rating
      prev.bestPos = Math.min(prev.bestPos, idx + 1)
      byName.set(key, prev)
    })
  }

  const ranked = [...byName.values()]
    .map((c) => ({ ...c, appearances: c.queries.size }))
    .sort((a, b) => b.appearances - a.appearances || a.bestPos - b.bestPos)
    .slice(0, limit)

  const proximityByName = new Map<string, LatLng | null>()
  for (const p of proximityCompetitors ?? []) {
    if (p?.name) proximityByName.set(normalize(p.name), p.location ?? null)
  }

  return Promise.all(
    ranked.map(async (c) => {
      const key = normalize(c.name)
      const proxLocation = proximityByName.get(key) ?? null
      let location: LatLng | null = proxLocation
      const fromProximity = Boolean(proxLocation)
      if (!location) {
        location = await findPlaceLocation(c.name, bias).catch(() => null)
        // descarta matches ambiguos que caen lejos de la zona
        if (location && bias && distanceKm(bias, location) > MAX_DISTANCE_KM) {
          location = null
        }
      }
      return {
        name: c.name,
        rating: c.rating,
        location,
        appearances: c.appearances,
        fromProximity,
      }
    })
  )
}
