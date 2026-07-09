import axios from 'axios'
import env from '#start/env'

const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

type AutocompletePrediction = {
  description: string
  place_id: string
}

export async function autocomplete(input: string): Promise<AutocompletePrediction[]> {
  const { data } = await axios.get(`${BASE_URL}/autocomplete/json`, {
    params: {
      input,
      components: 'country:mx',
      language: 'es',
      types: 'establishment',
      key: env.get('GOOGLE_PLACES_API_KEY'),
    },
  })

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places autocomplete error: ${data.status} ${data.error_message ?? ''}`)
  }

  return (data.predictions ?? []).map((p: any) => ({
    description: p.description,
    place_id: p.place_id,
  }))
}

/**
 * Resuelve la ubicación (lat/lng) de un negocio por su nombre, con sesgo hacia
 * una coordenada (la zona del restaurante). Se usa para pintar en el mapa a los
 * competidores de búsqueda (DataForSEO da nombre pero no coords).
 */
export async function findPlaceLocation(
  name: string,
  bias: { lat: number; lng: number } | null
): Promise<{ lat: number; lng: number } | null> {
  const { data } = await axios.get(`${BASE_URL}/findplacefromtext/json`, {
    params: {
      input: name,
      inputtype: 'textquery',
      fields: 'geometry',
      language: 'es',
      ...(bias ? { locationbias: `point:${bias.lat},${bias.lng}` } : {}),
      key: env.get('GOOGLE_PLACES_API_KEY'),
    },
  })

  if (data.status !== 'OK') return null
  const loc = data.candidates?.[0]?.geometry?.location
  return loc ? { lat: loc.lat, lng: loc.lng } : null
}

export type PlaceReview = {
  authorName: string
  profilePhotoUrl: string | null
  rating: number | null
  relativeTimeDescription: string | null
  text: string
}

export type AddressComponent = {
  long_name: string
  short_name: string
  types: string[]
}

export type PlaceDetails = {
  name: string
  formatted_address: string | null
  formatted_phone_number: string | null
  website: string | null
  rating: number | null
  user_ratings_total: number | null
  price_level: number | null
  opening_hours: Record<string, unknown> | null
  types: string[]
  address_components: AddressComponent[]
  dine_in: boolean | null
  takeout: boolean | null
  delivery: boolean | null
  geometry: { location: { lat: number; lng: number } } | null
  photoReferences: string[]
  reviews: PlaceReview[]
  raw: Record<string, unknown>
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const { data } = await axios.get(`${BASE_URL}/details/json`, {
    params: {
      place_id: placeId,
      language: 'es',
      fields:
        'name,formatted_address,address_components,formatted_phone_number,website,rating,user_ratings_total,opening_hours,price_level,types,dine_in,takeout,delivery,geometry,photos,reviews',
      key: env.get('GOOGLE_PLACES_API_KEY'),
    },
  })

  if (data.status !== 'OK') {
    throw new Error(`Google Places details error: ${data.status} ${data.error_message ?? ''}`)
  }

  const result = data.result ?? {}

  return {
    name: result.name,
    formatted_address: result.formatted_address ?? null,
    formatted_phone_number: result.formatted_phone_number ?? null,
    website: result.website ?? null,
    rating: result.rating ?? null,
    user_ratings_total: result.user_ratings_total ?? null,
    price_level: result.price_level ?? null,
    opening_hours: result.opening_hours ?? null,
    types: result.types ?? [],
    address_components: (result.address_components ?? []).map((c: any) => ({
      long_name: c.long_name ?? '',
      short_name: c.short_name ?? '',
      types: c.types ?? [],
    })),
    dine_in: result.dine_in ?? null,
    takeout: result.takeout ?? null,
    delivery: result.delivery ?? null,
    geometry: result.geometry ?? null,
    photoReferences: (result.photos ?? []).map((p: any) => p.photo_reference).filter(Boolean),
    reviews: (result.reviews ?? []).map((r: any) => ({
      authorName: r.author_name,
      profilePhotoUrl: r.profile_photo_url ?? null,
      rating: r.rating ?? null,
      relativeTimeDescription: r.relative_time_description ?? null,
      text: r.text ?? '',
    })),
    raw: result,
  }
}

/**
 * Sigue el redirect que da Google Place Photos y regresa la URL final de la
 * imagen (googleusercontent.com), para que el frontend la use directo sin
 * necesitar la API key.
 */
export async function resolvePhotoUrl(
  photoReference: string,
  maxWidth = 480
): Promise<string | null> {
  try {
    const response = await axios.get(`${BASE_URL}/photo`, {
      params: {
        photoreference: photoReference,
        maxwidth: maxWidth,
        key: env.get('GOOGLE_PLACES_API_KEY'),
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    })
    return response.headers.location ?? null
  } catch (error: any) {
    if (error.response?.status >= 300 && error.response?.status < 400) {
      return error.response.headers.location ?? null
    }
    console.error('Error resolviendo foto de Google Places:', error.message)
    return null
  }
}

type Competitor = {
  place_id: string
  name: string
  rating: number | null
  user_ratings_total: number | null
  vicinity: string | null
  location: { lat: number; lng: number } | null
}

export async function getNearbyCompetitors(
  location: { lat: number; lng: number },
  excludePlaceId: string,
  limit = 8
): Promise<Competitor[]> {
  const { data } = await axios.get(`${BASE_URL}/nearbysearch/json`, {
    params: {
      location: `${location.lat},${location.lng}`,
      rankby: 'distance',
      type: 'restaurant',
      language: 'es',
      key: env.get('GOOGLE_PLACES_API_KEY'),
    },
  })

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places nearby search error: ${data.status} ${data.error_message ?? ''}`)
  }

  const results = (data.results ?? []) as any[]

  // Gate de calidad + ranking honesto:
  //  - solo negocios OPERACIONALES,
  //  - preferimos los que tienen volumen real de reseñas (sin vaciar la lista en
  //    zonas de poca actividad: si el gate deja <4, se relaja),
  //  - ordenamos por promedio bayesiano (rating ponderado por # de reseñas) para
  //    que un ★5 con 2 reseñas NO le gane a un ★4.5 con miles.
  const MIN_REVIEWS = 15
  const PRIOR_MEAN = 4.0
  const PRIOR_WEIGHT = 30
  const bayes = (rating: number | null, reviews: number | null) => {
    const r = rating ?? 0
    const n = reviews ?? 0
    return (r * n + PRIOR_MEAN * PRIOR_WEIGHT) / (n + PRIOR_WEIGHT)
  }

  const operational = results
    .filter((r) => r.place_id !== excludePlaceId)
    .filter((r) => (r.business_status ? r.business_status === 'OPERATIONAL' : true))

  const withEnoughReviews = operational.filter((r) => (r.user_ratings_total ?? 0) >= MIN_REVIEWS)
  const pool = withEnoughReviews.length >= 4 ? withEnoughReviews : operational

  return pool
    .sort((a, b) => bayes(b.rating, b.user_ratings_total) - bayes(a.rating, a.user_ratings_total))
    .slice(0, limit)
    .map((r) => ({
      place_id: r.place_id,
      name: r.name,
      rating: r.rating ?? null,
      user_ratings_total: r.user_ratings_total ?? null,
      vicinity: r.vicinity ?? null,
      location: r.geometry?.location
        ? { lat: r.geometry.location.lat, lng: r.geometry.location.lng }
        : null,
    }))
}
