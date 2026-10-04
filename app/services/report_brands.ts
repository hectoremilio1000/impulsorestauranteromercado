import env from '#start/env'

/**
 * MARCAS que pueden capturar un lead del Reporte AI.
 *
 * ── Por qué la marca vive en el LEAD y no en el reporte ───────────────────────
 * Un `RestaurantReport` se deduplica por `place_id` a nivel global y se refresca cada
 * `REPORT_FRESHNESS_HOURS`: si Impulso ya analizó un restaurante y después alguien lo
 * busca desde Growthsuite, se reutiliza LA MISMA fila. El reporte, por lo tanto, no
 * pertenece a nadie. El lead sí: lo captura un sitio concreto, con su formulario, y hay
 * que contestarle con esa marca.
 *
 * ── Fail-safe hacia Impulso ──────────────────────────────────────────────────
 * `DEFAULT_BRAND` es 'impulso' y la columna nace con ese default. Una petición que no
 * mande `brand` —todo lo que existe hoy— se comporta exactamente como antes. Un valor
 * desconocido tampoco rompe: cae al default en vez de lanzar. El correo equivocado es
 * malo; no mandar correo porque alguien escribió mal un campo es peor.
 */

export const REPORT_BRANDS = ['impulso', 'growthsuite'] as const
export type ReportBrand = (typeof REPORT_BRANDS)[number]

export const DEFAULT_BRAND: ReportBrand = 'impulso'

export type BrandProfile = {
  /** Nombre como lo lee una persona en el correo. */
  name: string
  /** Logo del encabezado. Debe ser una URL pública y estable: los correos se abren meses después. */
  logoUrl: string
  /** Color de acento: botón y nombre de la marca. */
  accent: string
  /** Color del encabezado y del texto sobre el botón. */
  dark: string
  /** Texto del pie. */
  footer: string
  /** Remitente, con nombre visible. El dominio tiene que estar verificado en Resend. */
  from: string
  /** Clave de Resend de esa marca. Cada dominio verificado tiene la suya. */
  apiKey: () => string | undefined
  /** Base del enlace "Ver mi reporte completo". */
  frontendUrl: () => string
}

/**
 * Los valores de Growthsuite NO son inventados: salen de `prospects_controller.ts:375`,
 * que ya manda correos como Growthsuite desde este mismo backend con el dominio
 * verificado y su propia clave de Resend. Reusarlos evita estrenar un remitente que
 * podría rebotar.
 */
const PROFILES: Record<ReportBrand, BrandProfile> = {
  impulso: {
    name: 'Impulso Restaurantero',
    logoUrl:
      'https://www.impulsorestaurantero.com/_next/static/media/logoPalabrasFinalImpulsoRestaurantero.4cf72051.png',
    accent: '#a78b21',
    dark: '#0a0a0a',
    footer: 'Impulso Restaurantero · impulsorestaurantero.com',
    from: env.get('SMTP_FROM'),
    apiKey: () => env.get('RESEND_API_KEY'),
    frontendUrl: () => env.get('FRONTEND_URL'),
  },
  growthsuite: {
    name: 'Growthsuite',
    logoUrl: 'https://www.growthsuite.com.mx/logoGrowthsuite.png',
    accent: '#1d85f4',
    dark: '#0f172a',
    footer: 'Growthsuite · growthsuite.com.mx',
    from: 'Growthsuite <clientes@growthsuite.com.mx>',
    apiKey: () => env.get('RESEND_API_KEY_GROWTHSUITE'),
    /**
     * `GROWTHSUITE_FRONTEND_URL` es opcional a propósito. La página
     * /reporte-ai/resultado todavía no está en producción en growthsuite.com.mx; hasta
     * que lo esté, el enlace cae al frontend de Impulso, que sí la tiene. Un correo que
     * lleva al reporte en el sitio equivocado sirve; uno que lleva a un 404, no.
     */
    frontendUrl: () => env.get('GROWTHSUITE_FRONTEND_URL') || env.get('FRONTEND_URL'),
  },
}

/** Normaliza cualquier entrada a una marca válida. Nunca lanza. */
export function resolveBrand(raw: unknown): ReportBrand {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase()
  return (REPORT_BRANDS as readonly string[]).includes(value)
    ? (value as ReportBrand)
    : DEFAULT_BRAND
}

export function brandProfile(brand: ReportBrand): BrandProfile {
  return PROFILES[brand] ?? PROFILES[DEFAULT_BRAND]
}
