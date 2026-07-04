import type { PlaceDetails } from '#services/google_places_service'

export type LocalListingsIssue = {
  key: string
  label: string
  weight: number
  checkable: boolean
  pass: boolean | null
}

const THIRD_PARTY_ORDERING_HOSTS = ['rappi.com', 'ubereats.com', 'didi', 'pedidosya.com']

function isOwnWebsite(website: string | null): boolean {
  if (!website) return false
  const host = website.toLowerCase()
  return !THIRD_PARTY_ORDERING_HOSTS.some((platform) => host.includes(platform))
}

function hasAnyServiceOption(details: PlaceDetails): boolean {
  return Boolean(details.dine_in || details.takeout || details.delivery)
}

export function scoreLocalListings(details: PlaceDetails): {
  score: number
  maxScore: number
  issues: LocalListingsIssue[]
} {
  const checkableIssues: LocalListingsIssue[] = [
    {
      key: 'rating_reviews',
      label: 'Buena calificación y volumen de reseñas (4.2+ y 30+ reseñas)',
      weight: 4,
      checkable: true,
      pass: (details.rating ?? 0) >= 4.2 && (details.user_ratings_total ?? 0) >= 30,
    },
    {
      key: 'own_website',
      label: 'El perfil enlaza a tu propio sitio web (no sólo a un tercero)',
      weight: 4,
      checkable: true,
      pass: isOwnWebsite(details.website),
    },
    {
      key: 'opening_hours',
      label: 'Muestra horario de operación',
      weight: 3,
      checkable: true,
      pass: Boolean(details.opening_hours),
    },
    {
      key: 'phone',
      label: 'Muestra número de teléfono',
      weight: 3,
      checkable: true,
      pass: Boolean(details.formatted_phone_number),
    },
    {
      key: 'price_level',
      label: 'Tiene rango de precios configurado',
      weight: 3,
      checkable: true,
      pass: details.price_level !== null && details.price_level !== undefined,
    },
    {
      key: 'service_options',
      label: 'Tiene opciones de servicio (comer aquí, para llevar o a domicilio)',
      weight: 3,
      checkable: true,
      pass: hasAnyServiceOption(details),
    },
  ]

  const notYetCheckableIssues: LocalListingsIssue[] = [
    {
      key: 'social_links',
      label: 'Tiene enlaces a redes sociales',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'description',
      label: 'Tiene una descripción atractiva',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'description_keywords',
      label: 'La descripción incluye keywords relevantes',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'categories_keywords',
      label: 'Las categorías del perfil coinciden con tus keywords',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'quality_reviews',
      label: 'Reseñas de calidad (contenido, no sólo cantidad)',
      weight: 0,
      checkable: false,
      pass: null,
    },
  ]

  const maxScore = checkableIssues.reduce((sum, issue) => sum + issue.weight, 0)
  const score = checkableIssues.reduce((sum, issue) => sum + (issue.pass ? issue.weight : 0), 0)

  return {
    score,
    maxScore,
    issues: [...checkableIssues, ...notYetCheckableIssues],
  }
}

export function scoreLabel(totalScore: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
  if (totalScore >= 90) return 'Excellent'
  if (totalScore >= 70) return 'Good'
  if (totalScore >= 50) return 'Fair'
  return 'Poor'
}
