import { test } from '@japa/runner'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import type { PlaceDetails } from '#services/google_places_service'
import { isReservationCta, scrapeWebsite, type WebsiteScrape } from '#services/website_scraper_service'
import {
  deriveZoneTerms,
  parseStreetAddress,
  scoreGuestExperience,
  scoreSeo,
  siteShowsBusinessAddress,
  titleMatchesBusinessName,
} from '#services/website_scoring_service'

const ADDRESS =
  'Av. Álvaro Obregón 308, Hipódromo, Cuauhtémoc, 06100 Ciudad de México, CDMX, México'

function details(overrides: Partial<PlaceDetails> = {}): PlaceDetails {
  return {
    name: 'Cantina La Llorona',
    formatted_address: ADDRESS,
    formatted_phone_number: '55 1234 5678',
    website: 'https://example.test/',
    rating: 4.5,
    user_ratings_total: 1000,
    price_level: 2,
    opening_hours: {},
    types: ['restaurant', 'bar'],
    address_components: [],
    dine_in: true,
    takeout: false,
    delivery: false,
    geometry: null,
    photoReferences: [],
    reviews: [],
    raw: {},
    ...overrides,
  }
}

function scrape(overrides: Partial<WebsiteScrape> = {}): WebsiteScrape {
  return {
    title: null,
    metaDescription: null,
    h1Texts: [],
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    hasTwitterCard: false,
    faviconPresent: false,
    totalImages: 0,
    imagesMissingAlt: 0,
    visibleTextLength: 0,
    visibleText: '',
    socialLinks: [],
    hasPhoneLink: false,
    addressLikelyPresent: false,
    openingHoursLikelyPresent: false,
    orderCtaPresent: false,
    orderCtaOnlyExternal: false,
    aboutSectionLikelyPresent: false,
    faqLikelyPresent: false,
    orderBenefitsCopyLikelyPresent: false,
    viewportMetaPresent: false,
    finalUrl: 'https://example.test/',
    ...overrides,
  }
}

function check(issues: { key: string; pass: boolean | null }[], key: string) {
  const issue = issues.find((i) => i.key === key)
  if (!issue) throw new Error(`no existe el check ${key}`)
  return issue
}

test.group('Zona de servicio', () => {
  test('quita calle, país y código postal', ({ assert }) => {
    assert.deepEqual(deriveZoneTerms(ADDRESS), [
      'Hipódromo',
      'Cuauhtémoc',
      'Ciudad de México',
      'CDMX',
    ])
  })

  test('acepta la ciudad sin código postal y sin acentos; rechaza otra zona', ({ assert }) => {
    const ok = scoreSeo(details(), scrape({ h1Texts: ['Vive México en la Roma, Ciudad de Mexico'] }))
    assert.isTrue(check(ok.issues, 'h1_includes_zone').pass)

    const otra = scoreSeo(details(), scrape({ h1Texts: ['La mejor cantina de Polanco, Miguel Hidalgo'] }))
    assert.isFalse(check(otra.issues, 'h1_includes_zone').pass)
  })

  test('por palabra completa: "Hipódromo" no coincide dentro de otra palabra', ({ assert }) => {
    const r = scoreSeo(details(), scrape({ title: 'Restaurante Hipodromos del Norte' }))
    assert.isFalse(check(r.issues, 'title_includes_zone').pass)
  })
})

test.group('Nombre comercial en el <title>', () => {
  test('mismas palabras en otro orden sí coinciden', ({ assert }) => {
    assert.isTrue(
      titleMatchesBusinessName('La Llorona Cantina | Restaurante Mexicano', 'Cantina La Llorona')
    )
  })

  test('otro negocio o una palabra de menos no coincide', ({ assert }) => {
    assert.isFalse(titleMatchesBusinessName('La Llorona Bar | CDMX', 'Cantina La Llorona'))
    assert.isFalse(titleMatchesBusinessName('Cantina El Llorón', 'Cantina La Llorona'))
    assert.isFalse(titleMatchesBusinessName('Cantina La Lloronita', 'Cantina La Llorona'))
    assert.isFalse(titleMatchesBusinessName(null, 'Cantina La Llorona'))
  })

  test('se usa en el check del reporte', ({ assert }) => {
    const r = scoreSeo(details(), scrape({ title: 'La Llorona Cantina | Roma Condesa CDMX' }))
    assert.isTrue(check(r.issues, 'title_matches_business_name').pass)
  })
})

test.group('Dirección del negocio en el sitio', () => {
  test('separa calle y número de la dirección de Google', ({ assert }) => {
    assert.deepEqual(parseStreetAddress(ADDRESS), { street: 'alvaro obregon', number: '308' })
    assert.deepEqual(parseStreetAddress('Calle 5 de Mayo 32, Centro, CDMX, México'), {
      street: '5 de mayo',
      number: '32',
    })
    assert.isNull(parseStreetAddress('Hipódromo, Cuauhtémoc, CDMX, México'))
  })

  test('acepta la misma calle y número, con o sin tipo de vialidad, acentos o "#"', ({ assert }) => {
    for (const text of [
      'Visítanos en Álvaro Obregón 308, Roma',
      'Av. Alvaro Obregon #308',
      'avenida álvaro obregón no. 308',
    ]) {
      assert.isTrue(siteShowsBusinessAddress(ADDRESS, scrape({ visibleText: text })), text)
    }
  })

  test('rechaza otra calle, otro número o un número que sólo empieza igual', ({ assert }) => {
    for (const text of [
      'Estamos en Álvaro Obregón 210',
      'Estamos en Insurgentes Sur 308',
      'Álvaro Obregón 3080',
      'Calle Durango 12, colonia Roma',
    ]) {
      assert.isFalse(siteShowsBusinessAddress(ADDRESS, scrape({ visibleText: text })), text)
    }
  })

  test('sin calle con número en Google, usa el detector genérico (incluye "Av.")', ({ assert }) => {
    const sinNumero = 'Hipódromo, Cuauhtémoc, CDMX, México'
    assert.isTrue(
      siteShowsBusinessAddress(sinNumero, scrape({ addressLikelyPresent: true, visibleText: '' }))
    )
    assert.isFalse(siteShowsBusinessAddress(sinNumero, scrape({ addressLikelyPresent: false })))
  })
})

test.group('CTA para ordenar o reservar', () => {
  test('"¡Reserva ya!" hacia el flujo de reserva cuenta', ({ assert }) => {
    assert.isTrue(isReservationCta('¡reserva ya!', '/reserva/'))
    assert.isTrue(isReservationCta('reservar mesa', 'https://www.opentable.com.mx/r/x'))
    assert.isTrue(isReservationCta('book a table', '/booking'))
  })

  test('texto de reserva hacia otra página, o palabra parecida, no cuenta', ({ assert }) => {
    assert.isFalse(isReservationCta('¡reserva ya!', '/nosotros'))
    assert.isFalse(isReservationCta('reservado para socios', '/reserva'))
    assert.isFalse(isReservationCta('nuestro menú', '/reserva'))
  })

  test('el mensaje del reporte habla de ordenar o reservar', ({ assert }) => {
    const r = scoreGuestExperience(details(), scrape(), 80)
    const cta = r.issues.find((i) => i.key === 'order_cta_clear')!
    assert.include(cta.label, 'ordenar o reservar')
    assert.include(cta.problem ?? '', 'ordenar o reservar')
  })
})

test.group('Velocidad móvil', () => {
  test('sin medición: pass null, dice por qué y no suma puntos', ({ assert }) => {
    const r = scoreGuestExperience(details(), scrape(), null, 'PageSpeed HTTP 403: disabled')
    const speed = r.issues.find((i) => i.key === 'page_speed')!
    assert.isNull(speed.pass)
    assert.isFalse(speed.measured)
    assert.equal(speed.measurement_error, 'PageSpeed HTTP 403: disabled')
    assert.include(speed.problem ?? '', 'No pudimos medir')
    const conMedicion = scoreGuestExperience(details(), scrape(), 90)
    assert.equal(conMedicion.score - r.score, 3)
  })

  test('con medición baja sí reprueba, con el valor guardado', ({ assert }) => {
    const r = scoreGuestExperience(details(), scrape(), 31)
    const speed = r.issues.find((i) => i.key === 'page_speed')!
    assert.isFalse(speed.pass)
    assert.equal(speed.measured_value, 31)
  })
})

test.group('Scraper (servidor local)', (group) => {
  let server: http.Server
  let baseUrl = ''

  group.setup(async () => {
    server = http.createServer((_req, res) => {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      res.end(`<!doctype html><html><head><title>La Llorona Cantina</title></head><body>
        <img src="/a.jpg" alt="Taco de barbacoa">
        <img src="/decorativa.svg" alt="">
        <img src="/sin-alt.jpg">
        <a href="/reserva/"><button>¡Reserva ya!</button></a>
        <p>Av. Álvaro Obregón 308</p>
      </body></html>`)
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
    return () => new Promise<void>((resolve) => server.close(() => resolve()))
  })

  test('alt="" es decorativa; sólo falta alt cuando no hay atributo', async ({ assert }) => {
    const s = await scrapeWebsite(baseUrl)
    assert.equal(s.totalImages, 3)
    assert.equal(s.imagesMissingAlt, 1)
  })

  test('reconoce el botón de reserva dentro del enlace y la dirección', async ({ assert }) => {
    const s = await scrapeWebsite(baseUrl)
    assert.isTrue(s.orderCtaPresent)
    assert.isFalse(s.orderCtaOnlyExternal)
    assert.isTrue(s.addressLikelyPresent)
    assert.isTrue(siteShowsBusinessAddress(ADDRESS, s))
  })
})
