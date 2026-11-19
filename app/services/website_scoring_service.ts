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

const POSTAL_CODE_RE = /\b\d{4,5}\b/g

// Zona = colonia, alcaldía/municipio, ciudad y estado de la dirección de Google.
// - El primer segmento es la calle y el número: es dirección, no zona.
// - El último segmento suele ser el país.
// - El código postal va pegado a la ciudad ("06100 Ciudad de México"); se quita
//   para que "Ciudad de México" pueda coincidir.
export function deriveZoneTerms(formattedAddress: string | null): string[] {
  if (!formattedAddress) return []
  const segments = formattedAddress.split(',').map((part) => part.trim())
  const withoutStreet = /\d/.test(segments[0] ?? '') ? segments.slice(1) : segments
  return withoutStreet
    .slice(0, -1)
    .map((part) => part.replace(POSTAL_CODE_RE, '').replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 3 && !/^[A-Z]{2}$/.test(part))
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Coincidencia por palabra completa y sin acentos: "Roma" no coincide con
// "Romano", y "Hipódromo" coincide con "Hipodromo".
function containsWholeWord(haystack: string | null, needles: string[]): boolean {
  if (!haystack || needles.length === 0) return false
  const normalizedHaystack = normalize(haystack)
  return needles.some((needle) => {
    const n = normalize(needle).trim()
    if (!n) return false
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(n)}($|[^a-z0-9])`).test(normalizedHaystack)
  })
}

const NAME_STOPWORDS = new Set([
  'la', 'el', 'los', 'las', 'de', 'del', 'y', 'e', 'the', 'and', 'of', '&', '-', '|',
])

function nameTokens(name: string): string[] {
  return normalize(name)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0 && !NAME_STOPWORDS.has(token))
}

// El <title> "coincide" con el nombre de la ficha si contiene TODAS sus palabras
// significativas, en cualquier orden: "La Llorona Cantina" = "Cantina La Llorona".
// Si falta una palabra ("La Llorona Bar"), no coincide.
export function titleMatchesBusinessName(title: string | null, businessName: string): boolean {
  if (!title) return false
  const tokens = nameTokens(businessName)
  if (tokens.length === 0) return false
  const titleTokens = new Set(nameTokens(title))
  return tokens.every((token) => titleTokens.has(token))
}

const STREET_TYPE_PREFIX_RE =
  /^(avenida|av\.?|calle|c\.|boulevard|blvd\.?|bulevar|calzada|calz\.?|prolongacion|prol\.?|cerrada|privada|andador|circuito|eje)\s+/

// Calle y número de la dirección de Google: "Av. Álvaro Obregón 308" →
// { street: "alvaro obregon", number: "308" }. null si no hay número.
export function parseStreetAddress(
  formattedAddress: string | null
): { street: string; number: string } | null {
  if (!formattedAddress) return null
  const first = normalize(formattedAddress.split(',')[0] ?? '').trim()
  const match = first.match(/^(.+?)\s+(?:#|no\.?\s*|num\.?\s*)?(\d+[a-z]?)(?:\s+(?:int|interior|local|piso|depto)\b.*)?$/)
  if (!match) return null
  const street = match[1].replace(STREET_TYPE_PREFIX_RE, '').trim()
  if (street.length < 3) return null
  return { street, number: match[2] }
}

// La dirección "está" en el sitio si aparece la calle Y el número del negocio
// según Google (con o sin tipo de vialidad, "#" o "No."). Una dirección de otra
// calle u otro número no cuenta. Si Google no trae calle con número, se usa el
// detector genérico del scraper.
export function siteShowsBusinessAddress(
  formattedAddress: string | null,
  scrape: WebsiteScrape | null
): boolean {
  if (!scrape) return false
  const parsed = parseStreetAddress(formattedAddress)
  if (!parsed) return scrape.addressLikelyPresent
  const text = normalize(scrape.visibleText)
  const street = escapeRegExp(parsed.street).replace(/\s+/g, '\\s+')
  const re = new RegExp(
    `(^|[^a-z0-9])${street}[\\s,]+(?:#\\s*|no\\.?\\s*|num\\.?\\s*)?${escapeRegExp(parsed.number)}($|[^a-z0-9])`
  )
  return re.test(text)
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

// `problem` (se muestra al FALLAR un check): lleva el término técnico EN
// NEGATIVO (con "no", útil para quien sí lo entiende) + una explicación en
// lenguaje simple de QUÉ PROVOCA (para el dueño no técnico).

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
      problem:
        'No tienes un dominio propio que Google pueda leer: dependes de terceros y pierdes el control de tu marca en internet.',
      why: 'Tener tu propio dominio te da control total sobre tu presencia en línea, en vez de depender de una plataforma de terceros.',
      group: 'Dominio',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape),
    },
    {
      key: 'single_domain',
      label: 'El sitio resuelve en un solo dominio, sin redirecciones extrañas',
      problem:
        'Tu sitio no resuelve en un solo dominio (tiene redirecciones raras): confunden a Google sobre tu dirección real y pierdes visitas.',
      why: 'Redirecciones innecesarias confunden a Google sobre cuál es tu dirección real y pueden perder visitas en el camino.',
      group: 'Dominio',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape),
    },
    {
      key: 'h1_exists',
      label: 'La página tiene un encabezado H1',
      problem:
        'Tu página no tiene un encabezado H1 (el título principal): Google no entiende de qué es tu negocio y te cuesta aparecer en búsquedas.',
      why: 'El H1 es el título principal de tu página y ayuda a Google a entender de qué trata tu negocio.',
      group: 'Título (H1)',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.h1Texts.length),
    },
    {
      key: 'h1_includes_zone',
      label: 'El H1 incluye tu zona de servicio (ciudad/colonia)',
      problem:
        'El H1 (título principal) no incluye tu zona (colonia/ciudad): apareces menos cuando alguien busca cerca de ti.',
      why: 'Mencionar tu ciudad o colonia en el título principal ayuda a que aparezcas en búsquedas locales.',
      group: 'Título (H1)',
      weight: 2,
      checkable: true,
      pass: containsWholeWord(h1Joined, zoneTerms),
    },
    {
      key: 'h1_includes_keywords',
      label: 'El H1 incluye keywords relevantes de tu negocio',
      problem:
        'El H1 (título principal) no incluye lo que vendes: Google no te asocia con esas búsquedas y te encuentran menos.',
      why: 'Incluir palabras clave de tu negocio en el título principal mejora tu visibilidad en los buscadores.',
      group: 'Título (H1)',
      weight: 2,
      checkable: true,
      pass: containsAny(h1Joined, keywords),
    },
    {
      key: 'images_alt',
      label: 'Las imágenes tienen texto alternativo (alt)',
      problem:
        'Las imágenes no tienen texto alternativo (alt): Google no puede leer qué muestran tus fotos, no salen en Google Imágenes y pierdes visibilidad.',
      why: 'El texto alternativo ayuda a Google (y a personas con discapacidad visual) a entender qué muestra cada imagen.',
      group: 'Metadatos',
      weight: 3,
      checkable: true,
      pass:
        !scrape || scrape.totalImages === 0 || scrape.imagesMissingAlt / scrape.totalImages < 0.2,
    },
    {
      key: 'meta_description_length',
      label: 'La meta description tiene longitud suficiente (50+ caracteres)',
      problem:
        'No tienes meta description (o es muy corta): el textito debajo de tu link en Google sale vacío, da mala impresión y menos gente hace clic.',
      why: 'Una meta description con suficiente longitud da más contexto en los resultados de búsqueda.',
      group: 'Metadatos',
      weight: 3,
      checkable: true,
      pass: (scrape?.metaDescription?.length ?? 0) >= 50,
    },
    {
      key: 'meta_description_zone',
      label: 'La meta description incluye tu zona de servicio',
      problem:
        'La meta description no incluye tu zona: ese textito en Google no menciona tu área y apareces menos localmente.',
      why: 'Mencionar tu zona en la meta description refuerza tu posicionamiento en búsquedas locales.',
      group: 'Metadatos',
      weight: 2,
      checkable: true,
      pass: containsWholeWord(scrape?.metaDescription ?? null, zoneTerms),
    },
    {
      key: 'meta_description_keywords',
      label: 'La meta description incluye keywords relevantes',
      problem:
        'La meta description no incluye lo que vendes: menos gente hace clic en tu link desde los resultados de Google.',
      why: 'Incluir palabras clave relevantes en tu meta description puede mejorar el clic desde los resultados de búsqueda.',
      group: 'Metadatos',
      weight: 2,
      checkable: true,
      pass: containsAny(scrape?.metaDescription ?? null, keywords),
    },
    {
      key: 'og_title',
      label: 'Tiene Open Graph title (og:title)',
      problem:
        'No tienes Open Graph title (og:title): cuando comparten tu link en WhatsApp o Facebook no aparece un título claro, se ve pobre y no le dan clic.',
      why: 'El og:title controla el título que se ve cuando comparten tu página en redes sociales.',
      group: 'Metadatos',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.ogTitle),
    },
    {
      key: 'og_description',
      label: 'Tiene Open Graph description (og:description)',
      problem:
        'No tienes Open Graph description (og:description): al compartir tu link no sale una descripción, se ve incompleto y da menos confianza para abrirlo.',
      why: 'El og:description controla la descripción que aparece cuando comparten tu página en redes sociales.',
      group: 'Metadatos',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.ogDescription),
    },
    {
      key: 'og_image',
      label: 'Tiene Open Graph image (og:image)',
      problem:
        'No tienes Open Graph image (og:image): cuando comparten tu link en WhatsApp o redes sale SIN imagen de vista previa, se ve poco atractivo y casi nadie lo abre.',
      why: 'Sin og:image, tu link se comparte sin imagen de vista previa en redes sociales y WhatsApp.',
      group: 'Metadatos',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.ogImage),
    },
    {
      key: 'twitter_card',
      label: 'Tiene Twitter card',
      problem:
        'No tienes Twitter card: al compartir tu sitio en X/Twitter no aparece una vista previa bonita — el link se ve simple y llama menos la atención.',
      why: 'Las Twitter cards dan una vista previa más rica cuando comparten tu sitio en Twitter/X.',
      group: 'Metadatos',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.hasTwitterCard),
    },
    {
      key: 'title_matches_business_name',
      label: 'El <title> coincide con el nombre de tu Perfil de Google Business',
      problem:
        'El <title> (nombre de tu página web) no coincide con tu ficha de Google: da incoherencia de marca y confunde al cliente.',
      why: 'Que el título de tu página coincida con tu ficha de Google da coherencia a tu marca en todas partes.',
      group: 'Metadatos',
      weight: 3,
      checkable: true,
      pass: titleMatchesBusinessName(scrape?.title ?? null, details.name),
    },
    {
      key: 'title_includes_zone',
      label: 'El <title> incluye tu zona de servicio',
      problem:
        'El <title> (nombre de tu página web) no incluye tu zona: apareces menos en las búsquedas locales de tu área.',
      why: 'Incluir tu zona en el título de la página ayuda a mejorar tu visibilidad en búsquedas locales.',
      group: 'Metadatos',
      weight: 3,
      checkable: true,
      pass: containsWholeWord(scrape?.title ?? null, zoneTerms),
    },
    {
      key: 'title_includes_keywords',
      label: 'El <title> incluye keywords relevantes',
      problem:
        'El <title> (nombre de tu página web) no incluye lo que vendes: Google te posiciona peor para esas búsquedas.',
      why: 'Una palabra clave relevante en el título de la página puede mejorar tu posicionamiento en buscadores.',
      group: 'Metadatos',
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
  mobilePerformanceScore: number | null,
  pageSpeedError: string | null = null
): { score: number; maxScore: number; issues: ScoredIssue[] } {
  const keywords = deriveKeywords(details.name, details.types)
  const bodyTextProxy = scrape ? `${scrape.title ?? ''} ${scrape.metaDescription ?? ''}` : null
  const goodReviews = (details.rating ?? 0) >= 4.2 && (details.user_ratings_total ?? 0) >= 30

  const issues: ScoredIssue[] = [
    {
      key: 'no_offsite_ordering',
      label: 'No manda a ordenar sólo a una plataforma externa (Rappi/UberEats/DiDi Food)',
      problem:
        'Mandas a ordenar sólo a apps externas (Rappi/UberEats/DiDi): pagas comisiones altas y pierdes el control de la experiencia y del cliente.',
      why: 'Depender solo de una plataforma externa para ordenar puede generar una experiencia inconexa y comisiones perdidas.',
      group: 'Contenido',
      weight: 3,
      checkable: true,
      pass: !scrape?.orderCtaOnlyExternal,
    },
    {
      key: 'order_cta_clear',
      label: 'Tiene un CTA claro para ordenar o reservar en línea',
      problem:
        'No tienes un botón (CTA) claro para ordenar o reservar en línea: el cliente llega con ganas y no encuentra cómo — se va.',
      why: 'Un llamado a la acción claro para ordenar o reservar puede aumentar significativamente tus conversiones.',
      group: 'Contenido',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.orderCtaPresent),
    },
    {
      key: 'sufficient_text',
      label: 'Tiene suficiente contenido de texto sobre el restaurante',
      problem:
        'Tu sitio tiene muy poco texto sobre tu negocio: Google no entiende bien qué ofreces y te encuentran menos.',
      why: 'Suficiente contenido de texto ayuda a Google a entender de qué trata tu negocio.',
      group: 'Contenido',
      weight: 3,
      checkable: true,
      pass: (scrape?.visibleTextLength ?? 0) >= 500,
    },
    {
      key: 'phone',
      label: 'Muestra número de teléfono',
      problem:
        'No muestras número de teléfono en tu sitio: le quitas al cliente una forma fácil y directa de contactarte.',
      why: 'Un teléfono visible en tu sitio aumenta las formas en que los clientes pueden contactarte para ordenar.',
      group: 'Contenido',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.hasPhoneLink),
    },
    {
      key: 'favicon',
      label: 'Tiene favicon',
      problem:
        'No tienes favicon (el iconito de la pestaña del navegador): tu sitio se ve menos profesional y confiable.',
      why: 'Un favicon da una apariencia más profesional cuando tu sitio está abierto en una pestaña del navegador.',
      group: 'Contenido',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.faviconPresent),
    },
    {
      key: 'social_links',
      label: 'Tiene enlaces a redes sociales',
      problem:
        'No tienes enlaces a tus redes sociales: el cliente no puede seguirte ni enterarse de tus promociones.',
      why: 'Los enlaces a redes sociales ayudan a los clientes a seguir tu marca y enterarse de promociones.',
      group: 'Contenido',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.socialLinks.length),
    },
    {
      key: 'opening_hours',
      label: 'Muestra horario de operación',
      problem:
        'No muestras tu horario en el sitio: el visitante no sabe si estás abierto y muchos desisten de ir.',
      why: 'Mostrar tu horario en el sitio ayuda a los visitantes a planear su visita sin tener que preguntar.',
      group: 'Contenido',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.openingHoursLikelyPresent),
    },
    {
      key: 'address',
      label: 'Muestra dirección',
      problem:
        'No muestras tu dirección en el sitio: al cliente le cuesta ubicarte y llegar a tu negocio.',
      why: 'Incluir tu dirección ayuda a los clientes a localizarte y llegar a tu negocio.',
      group: 'Contenido',
      weight: 3,
      checkable: true,
      pass: siteShowsBusinessAddress(details.formatted_address, scrape),
    },
    {
      key: 'content_keywords',
      label: 'El contenido incluye keywords relevantes',
      problem:
        'Tu contenido no incluye lo que vendes (keywords): Google te posiciona peor y te encuentran menos personas.',
      why: 'Palabras clave relevantes en tu contenido mejoran tu visibilidad en los buscadores.',
      group: 'Contenido',
      weight: 2,
      checkable: true,
      pass: containsAny(bodyTextProxy, keywords),
    },
    {
      key: 'about_section',
      label: 'Sección "Nosotros" o "Sobre el restaurante"',
      problem:
        'No tienes una sección "Nosotros"/"Sobre el restaurante": pierdes la oportunidad de conectar y generar confianza con el cliente.',
      why: 'Una historia convincente ayuda a crear una conexión emocional con tus clientes.',
      group: 'Apariencia',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.aboutSectionLikelyPresent),
    },
    {
      key: 'readable_text',
      label: 'Texto legible (tamaño y contraste adecuados)',
      why: 'Un texto fácil de leer garantiza que los visitantes entiendan rápido tu oferta.',
      group: 'Apariencia',
      weight: 0,
      checkable: false,
      pass: null,
    },
    {
      key: 'good_reviews',
      label: 'Buen número de reseñas',
      problem:
        'No tienes suficientes reseñas: sin opiniones, el cliente confía menos en ti y elige a otro.',
      why: 'Un buen número de reseñas genera confianza y credibilidad frente a clientes potenciales.',
      group: 'Apariencia',
      weight: 3,
      checkable: true,
      pass: goodReviews,
    },
    {
      key: 'faq',
      label: 'Sección de Preguntas Frecuentes (FAQ)',
      problem:
        'No tienes sección de Preguntas Frecuentes (FAQ): dejas dudas del cliente sin resolver y algunos no cierran por eso.',
      why: 'Una sección de FAQ da más información al cliente (y a Google) sin que tenga que preguntarte directo.',
      group: 'Apariencia',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.faqLikelyPresent),
    },
    {
      key: 'order_benefits_copy',
      label: 'Explica los beneficios de ordenar directo',
      problem:
        'No explicas los beneficios de ordenar directo contigo (vs. una app): pierdes pedidos que se van a plataformas con comisión.',
      why: 'Es más probable que un cliente ordene directo si entiende las ventajas de hacerlo (vs. una app de terceros).',
      group: 'Apariencia',
      weight: 2,
      checkable: true,
      pass: Boolean(scrape?.orderBenefitsCopyLikelyPresent),
    },
    // Sin medición no se afirma que el sitio sea lento: pass = null, el texto
    // dice que no se midió y por qué, y el punto no se otorga.
    mobilePerformanceScore === null
      ? {
          key: 'page_speed',
          label: 'Sitio rápido (velocidad de carga móvil)',
          problem:
            'No pudimos medir la velocidad de tu sitio en celular (Google PageSpeed no respondió): este punto queda sin calificar en este reporte.',
          why: 'Un sitio lento hace que los visitantes se vayan antes de ver tu menú, sobre todo desde el celular.',
          group: 'Usabilidad',
          weight: 3,
          checkable: true,
          pass: null,
          measured: false,
          measurement_error: pageSpeedError ?? 'Sin resultado de PageSpeed.',
        }
      : {
          key: 'page_speed',
          label: 'Sitio rápido (velocidad de carga móvil)',
          problem:
            'Tu sitio carga lento en el celular: muchos se van antes de ver tu menú (la mayoría entra desde el teléfono).',
          why: 'Un sitio lento hace que los visitantes se vayan antes de ver tu menú, sobre todo desde el celular.',
          group: 'Usabilidad',
          weight: 3,
          checkable: true,
          pass: mobilePerformanceScore >= 50,
          measured: true,
          measured_value: mobilePerformanceScore,
        },
    {
      key: 'mobile_optimized',
      label: 'Optimizado para móvil',
      problem:
        'Tu sitio no está optimizado para celular (móvil): se ve mal justo donde te visita la mayoría de tus clientes.',
      why: 'La mayoría de tus clientes te van a visitar desde el celular, así que tu sitio debe verse bien ahí.',
      group: 'Usabilidad',
      weight: 3,
      checkable: true,
      pass: Boolean(scrape?.viewportMetaPresent),
    },
  ]

  const maxScore = issues.reduce((sum, issue) => sum + issue.weight, 0)
  const score = issues.reduce((sum, issue) => sum + (issue.pass ? issue.weight : 0), 0)

  return { score, maxScore, issues }
}
