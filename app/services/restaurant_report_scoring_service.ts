import type { PlaceDetails } from '#services/google_places_service'

export type LocalListingsIssue = {
  key: string
  label: string
  why: string
  group: string
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

function hasQualityReviews(details: PlaceDetails): boolean {
  const reviews = details.reviews ?? []
  if (reviews.length === 0) return false
  const withRealContent = reviews.filter((review) => (review.text ?? '').trim().length >= 40)
  return withRealContent.length / reviews.length >= 0.5
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
      why: 'Un buen rating y volumen de reseñas es lo primero que ve un cliente antes de elegirte sobre la competencia.',
      group: 'Contenido del perfil',
      weight: 4,
      checkable: true,
      pass: (details.rating ?? 0) >= 4.2 && (details.user_ratings_total ?? 0) >= 30,
    },
    {
      key: 'own_website',
      label: 'El perfil enlaza a tu propio sitio web (no sólo a un tercero)',
      why: 'Enlazar a tu propio sitio te da control total sobre la experiencia, en vez de depender de un tercero.',
      group: 'Contenido del perfil',
      weight: 4,
      checkable: true,
      pass: isOwnWebsite(details.website),
    },
    {
      key: 'opening_hours',
      label: 'Muestra horario de operación',
      why: 'Mostrar tu horario evita que los clientes lleguen cuando estás cerrado, o que desistan por no saber si estás abierto.',
      group: 'Contenido del perfil',
      weight: 3,
      checkable: true,
      pass: Boolean(details.opening_hours),
    },
    {
      key: 'phone',
      label: 'Muestra número de teléfono',
      why: 'Un teléfono visible facilita que te llamen directo para reservar o preguntar, sin pasar por un tercero.',
      group: 'Contenido del perfil',
      weight: 3,
      checkable: true,
      pass: Boolean(details.formatted_phone_number),
    },
    {
      key: 'price_level',
      label: 'Tiene rango de precios configurado',
      why: 'Mostrar tu rango de precios genera expectativas claras y filtra clientes antes de que lleguen.',
      group: 'Contenido del perfil',
      weight: 3,
      checkable: true,
      pass: details.price_level !== null && details.price_level !== undefined,
    },
    {
      key: 'service_options',
      label: 'Tiene opciones de servicio (comer aquí, para llevar o a domicilio)',
      why: 'Mostrar tus opciones de servicio ayuda a que el cliente sepa cómo puede consumir en tu negocio antes de llegar.',
      group: 'Contenido del perfil',
      weight: 3,
      checkable: true,
      pass: hasAnyServiceOption(details),
    },
    {
      key: 'quality_reviews',
      label: 'Reseñas de calidad (contenido, no sólo cantidad)',
      why: 'Reseñas con comentarios reales generan más confianza que solo un número de estrellas.',
      group: 'Contenido enviado por el usuario',
      weight: 0,
      checkable: true,
      pass: hasQualityReviews(details),
    },
  ]

  const notYetCheckableIssues: LocalListingsIssue[] = [
    {
      key: 'social_links',
      label: 'Tiene enlaces a redes sociales',
      why: 'Los enlaces a redes sociales en tu perfil amplían tu alcance y dan más formas de conectar con clientes.',
      group: 'Contenido del perfil',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'description',
      label: 'Tiene una descripción atractiva',
      why: 'Una buena descripción ayuda a que el cliente entienda qué te hace diferente antes de visitarte.',
      group: 'Contenido del perfil',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'description_keywords',
      label: 'La descripción incluye keywords relevantes',
      why: 'Incluir palabras clave relevantes en tu descripción mejora que Google te muestre en más búsquedas.',
      group: 'Contenido del perfil',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'categories_keywords',
      label: 'Las categorías del perfil coinciden con tus keywords',
      why: 'Que tus categorías de Google coincidan con lo que la gente busca ayuda a que aparezcas en más resultados.',
      group: 'Contenido del perfil',
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
