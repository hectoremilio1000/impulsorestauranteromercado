import axios from 'axios'
import * as cheerio from 'cheerio'

const THIRD_PARTY_ORDERING_HOSTS = ['rappi.com', 'ubereats.com', 'didi', 'pedidosya.com']

const ABOUT_KEYWORDS = [
  'nosotros',
  'nuestra historia',
  'quiénes somos',
  'quienes somos',
  'sobre nosotros',
]
const FAQ_KEYWORDS = ['preguntas frecuentes', 'faq']
const ORDER_CTA_KEYWORDS = [
  'ordenar',
  'pedir',
  'orden en línea',
  'orden en linea',
  'delivery',
  'domicilio',
]

// Un CTA de reserva cuenta cuando el texto invita a reservar (cualquier forma
// del verbo: "Reserva ya", "Reservar", "Reserva tu mesa", "Book a table") Y el
// enlace lleva a un flujo de reserva. Sólo el texto no basta: "Reserva" que
// lleva a /nosotros no es un botón para reservar.
const RESERVATION_TEXT_RE =
  /(^|[^a-z])(reserv(a|ar|e|en|as|aci[oó]n|aciones|ame|anos)|book( a| your)? table|book now|reserve)([^a-z]|$)/i
const RESERVATION_HREF_RE =
  /reserv|booking|\/book\b|opentable\.|resy\.com|sevenrooms\.|covermanager\.|eveve\.|calendly\.com|thefork\.|wa\.me\/|api\.whatsapp\.com\/send/i

export function isReservationCta(text: string, href: string): boolean {
  return RESERVATION_TEXT_RE.test(text) && RESERVATION_HREF_RE.test(href)
}

// Respaldo para cuando Google no trae calle y número: palabras de tipo de
// vialidad o colonia como palabra completa ("Av." incluido — antes `\bav\.\b`
// nunca coincidía porque después del punto viene un espacio).
const GENERIC_ADDRESS_RE =
  /(^|[\s,(])(calle|avenida|av\.|boulevard|blvd\.?|colonia|col\.|c\.p\.|cp\s?\d{5})(?=[\s,.)]|$)/i
const ORDER_BENEFITS_KEYWORDS = [
  'sin comisiones',
  'ordena directo',
  'ordenar directo',
  'mejor precio',
  'ahorra',
  'directo con nosotros',
]
const WEEKDAY_KEYWORDS = [
  'lunes',
  'martes',
  'miércoles',
  'miercoles',
  'jueves',
  'viernes',
  'sábado',
  'sabado',
  'domingo',
]

function textIncludesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase()
  return needles.some((needle) => lower.includes(needle))
}

export type WebsiteScrape = {
  title: string | null
  metaDescription: string | null
  h1Texts: string[]
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  hasTwitterCard: boolean
  faviconPresent: boolean
  totalImages: number
  /** Imágenes SIN atributo alt. alt="" es decorativa a propósito (WCAG/Lighthouse) y no cuenta. */
  imagesMissingAlt: number
  visibleTextLength: number
  /** Texto visible del body, sin scripts/estilos, espacios colapsados. */
  visibleText: string
  socialLinks: string[]
  hasPhoneLink: boolean
  addressLikelyPresent: boolean
  openingHoursLikelyPresent: boolean
  orderCtaPresent: boolean
  orderCtaOnlyExternal: boolean
  aboutSectionLikelyPresent: boolean
  faqLikelyPresent: boolean
  orderBenefitsCopyLikelyPresent: boolean
  viewportMetaPresent: boolean
  finalUrl: string
}

export async function scrapeWebsite(url: string): Promise<WebsiteScrape> {
  const { data: html, request } = await axios.get(url, {
    timeout: 10000,
    maxRedirects: 5,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ImpulsoRestauranteroBot/1.0; +https://www.impulsorestaurantero.com)',
    },
  })

  const finalUrl: string = request?.res?.responseUrl ?? url
  const $ = cheerio.load(html)

  const bodyText = $('body').clone().find('script, style, noscript').remove().end().text()
  const normalizedBodyText = bodyText.replace(/\s+/g, ' ').trim()

  const images = $('img')
  const imagesMissingAlt = images.filter((_, el) => $(el).attr('alt') === undefined).length

  const anchors = $('a[href]')
  const socialLinks: string[] = []
  let orderCtaPresent = false
  let orderCtaHasOwnDomainLink = false
  let orderCtaHasExternalLink = false

  anchors.each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const text = $(el).text().toLowerCase()
    const lowerHref = href.toLowerCase()

    if (
      /facebook\.com|instagram\.com|twitter\.com|x\.com|tiktok\.com|wa\.me|whatsapp\.com/.test(
        lowerHref
      )
    ) {
      socialLinks.push(href)
    }

    const isOrderLink = textIncludesAny(text, ORDER_CTA_KEYWORDS) || isReservationCta(text, href)
    const isThirdPartyOrderingLink = THIRD_PARTY_ORDERING_HOSTS.some((host) =>
      lowerHref.includes(host)
    )

    if (isOrderLink || isThirdPartyOrderingLink) {
      orderCtaPresent = true
      if (isThirdPartyOrderingLink) {
        orderCtaHasExternalLink = true
      } else if (href.startsWith('/') || lowerHref.includes(new URL(finalUrl).hostname)) {
        orderCtaHasOwnDomainLink = true
      }
    }
  })

  const hasPhoneLink =
    $('a[href^="tel:"]').length > 0 || /\+?\d[\d\s()-]{7,}\d/.test(normalizedBodyText)

  return {
    title: $('title').first().text().trim() || null,
    metaDescription: $('meta[name="description"]').attr('content')?.trim() || null,
    h1Texts: $('h1')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean),
    ogTitle: $('meta[property="og:title"]').attr('content')?.trim() || null,
    ogDescription: $('meta[property="og:description"]').attr('content')?.trim() || null,
    ogImage: $('meta[property="og:image"]').attr('content')?.trim() || null,
    hasTwitterCard: $('meta[name="twitter:card"]').length > 0,
    faviconPresent: $('link[rel*="icon"]').length > 0,
    totalImages: images.length,
    imagesMissingAlt,
    visibleTextLength: normalizedBodyText.length,
    socialLinks: Array.from(new Set(socialLinks)),
    hasPhoneLink,
    visibleText: normalizedBodyText,
    addressLikelyPresent: GENERIC_ADDRESS_RE.test(normalizedBodyText),
    openingHoursLikelyPresent: textIncludesAny(normalizedBodyText, WEEKDAY_KEYWORDS),
    orderCtaPresent,
    orderCtaOnlyExternal: orderCtaHasExternalLink && !orderCtaHasOwnDomainLink,
    aboutSectionLikelyPresent: textIncludesAny(normalizedBodyText, ABOUT_KEYWORDS),
    faqLikelyPresent: textIncludesAny(normalizedBodyText, FAQ_KEYWORDS),
    orderBenefitsCopyLikelyPresent: textIncludesAny(normalizedBodyText, ORDER_BENEFITS_KEYWORDS),
    viewportMetaPresent: $('meta[name="viewport"]').length > 0,
    finalUrl,
  }
}
