import type { PlaceDetails } from '#services/google_places_service'
import type { WebsiteScrape } from '#services/website_scraper_service'
import type { LocalListingsIssue as ScoredIssue } from '#services/restaurant_report_scoring_service'

const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  restaurant: ['restaurante'],
  bar: ['bar'],
  cafe: ['café', 'cafe'],
  bakery: ['panadería', 'panaderia'],
  meal_takeaway: ['para llevar'],
  meal_delivery: ['a domicilio', 'delivery'],
  night_club: ['antro', 'club nocturno'],
}

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function deriveZoneTerms(formattedAddress: string | null): string[] {
  if (!formattedAddress) return []
  return formattedAddress
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part) && !/^[A-Z]{2}$/.test(part))
    .slice(0, -1) // el último segmento suele ser el país, lo descartamos
}

function deriveKeywords(name: string, categories: string[] | null): string[] {
  const nameWords = name
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4)

  const categoryWords = (categories ?? []).flatMap((c) => CATEGORY_KEYWORD_MAP[c] ?? [])

  return [...nameWords, ...categoryWords]
}

function containsAny(haystack: string | null, needles: string[]): boolean {
  if (!haystack || needles.length === 0) return false
  const normalizedHaystack = normalize(haystack)
  return needles.some((needle) => normalizedHaystack.includes(normalize(needle)))
}

export function scoreSeo(
  details: PlaceDetails,
  scrape: WebsiteScrape | null
): { score: number; maxScore: number; issues: ScoredIssue[] } {
  const zoneTerms = deriveZoneTerms(details.formatted_address)
  const keywords = deriveKeywords(details.name, details.types)
  const h1Joined = scrape?.h1Texts.join(' ') ?? null

  const issues: ScoredIssue[] = [
    {
      key: 'custom_domain',
      label: 'Usa un dominio propio (no depende sólo de un tercero)',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape),
    },
    {
      key: 'single_domain',
      label: 'El sitio resuelve en un solo dominio, sin redirecciones extrañas',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape),
    },
    {
      key: 'h1_exists',
      label: 'La página tiene un encabezado H1',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.h1Texts.length),
    },
    {
      key: 'h1_includes_zone',
      label: 'El H1 incluye tu zona de servicio (ciudad/colonia)',
      weight: 2,
      checkable: true,
      pass: containsAny(h1Joined, zoneTerms),
    },
    {
      key: 'h1_includes_keywords',
      label: 'El H1 incluye keywords relevantes de tu negocio',
      weight: 2,
      checkable: true,
      pass: containsAny(h1Joined, keywords),
    },
    {
      key: 'images_alt',
      label: 'Las imágenes tienen texto alternativo (alt)',
      weight: 3,
      checkable: true,
      pass:
        !scrape || scrape.totalImages === 0 || scrape.imagesMissingAlt / scrape.totalImages < 0.2,
    },
    {
      key: 'meta_description_length',
      label: 'La meta description tiene longitud suficiente (50+ caracteres)',
      weight: 3,
      checkable: true,
      pass: (scrape?.metaDescription?.length ?? 0) >= 50,
    },
    {
      key: 'meta_description_zone',
      label: 'La meta description incluye tu zona de servicio',
      weight: 2,
      checkable: true,
      pass: containsAny(scrape?.metaDescription ?? null, zoneTerms),
    },
    {
      key: 'meta_description_keywords',
      label: 'La meta description incluye keywords relevantes',
      weight: 2,
      checkable: true,
      pass: containsAny(scrape?.metaDescription ?? null, keywords),
    },
    {
      key: 'og_title',
      label: 'Tiene Open Graph title (og:title)',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.ogTitle),
    },
    {
      key: 'og_description',
      label: 'Tiene Open Graph description (og:description)',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.ogDescription),
    },
    {
      key: 'og_image',
      label: 'Tiene Open Graph image (og:image)',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.ogImage),
    },
    {
      key: 'twitter_card',
      label: 'Tiene Twitter card',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.hasTwitterCard),
    },
    {
      key: 'title_matches_business_name',
      label: 'El <title> coincide con el nombre de tu Perfil de Google Business',
      weight: 3,
      checkable: true,
      pass: containsAny(scrape?.title ?? null, [details.name]),
    },
    {
      key: 'title_includes_zone',
      label: 'El <title> incluye tu zona de servicio',
      weight: 3,
      checkable: true,
      pass: containsAny(scrape?.title ?? null, zoneTerms),
    },
    {
      key: 'title_includes_keywords',
      label: 'El <title> incluye keywords relevantes',
      weight: 2,
      checkable: true,
      pass: containsAny(scrape?.title ?? null, keywords),
    },
  ]

  const maxScore = issues.reduce((sum, issue) => sum + issue.weight, 0)
  const score = issues.reduce((sum, issue) => sum + (issue.pass ? issue.weight : 0), 0)

  return { score, maxScore, issues }
}

export function scoreGuestExperience(
  details: PlaceDetails,
  scrape: WebsiteScrape | null,
  mobilePerformanceScore: number | null
): { score: number; maxScore: number; issues: ScoredIssue[] } {
  const keywords = deriveKeywords(details.name, details.types)
  const bodyTextProxy = scrape ? `${scrape.title ?? ''} ${scrape.metaDescription ?? ''}` : null
  const goodReviews = (details.rating ?? 0) >= 4.2 && (details.user_ratings_total ?? 0) >= 30

  const issues: ScoredIssue[] = [
    {
      key: 'no_offsite_ordering',
      label: 'No manda a ordenar sólo a una plataforma externa (Rappi/UberEats/DiDi Food)',
      weight: 3,
      checkable: true,
      pass: !scrape?.orderCtaOnlyExternal,
    },
    {
      key: 'order_cta_clear',
      label: 'Tiene un CTA claro para ordenar en línea',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.orderCtaPresent),
    },
    {
      key: 'sufficient_text',
      label: 'Tiene suficiente contenido de texto sobre el restaurante',
      weight: 3,
      checkable: true,
      pass: (scrape?.visibleTextLength ?? 0) >= 500,
    },
    {
      key: 'phone',
      label: 'Muestra número de teléfono',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.hasPhoneLink),
    },
    {
      key: 'favicon',
      label: 'Tiene favicon',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.faviconPresent),
    },
    {
      key: 'social_links',
      label: 'Tiene enlaces a redes sociales',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.socialLinks.length),
    },
    {
      key: 'opening_hours',
      label: 'Muestra horario de operación',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.openingHoursLikelyPresent),
    },
    {
      key: 'address',
      label: 'Muestra dirección',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.addressLikelyPresent),
    },
    {
      key: 'content_keywords',
      label: 'El contenido incluye keywords relevantes',
      weight: 2,
      checkable: true,
      pass: containsAny(bodyTextProxy, keywords),
    },
    {
      key: 'about_section',
      label: 'Sección "Nosotros" o "Sobre el restaurante"',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.aboutSectionLikelyPresent),
    },
    {
      key: 'readable_text',
      label: 'Texto legible (tamaño y contraste adecuados)',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'good_reviews',
      label: 'Buen número de reseñas',
      weight: 3,
      checkable: true,
      pass: goodReviews,
    },
    {
      key: 'faq',
      label: 'Sección de Preguntas Frecuentes (FAQ)',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.faqLikelyPresent),
    },
    {
      key: 'order_benefits_copy',
      label: 'Explica los beneficios de ordenar directo',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.orderBenefitsCopyLikelyPresent),
    },
    {
      key: 'page_speed',
      label: 'Sitio rápido (velocidad de carga móvil)',
      weight: 3,
      checkable: true,
      pass: mobilePerformanceScore !== null && mobilePerformanceScore >= 50,
    },
    {
      key: 'mobile_optimized',
      label: 'Optimizado para móvil',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.viewportMetaPresent),
    },
  ]

  const maxScore = issues.reduce((sum, issue) => sum + issue.weight, 0)
  const score = issues.reduce((sum, issue) => sum + (issue.pass ? issue.weight : 0), 0)

  return { score, maxScore, issues }
}
