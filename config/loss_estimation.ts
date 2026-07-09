/**
 * Constantes para el cálculo de "pérdida de ventas estimada" del Reporte AI.
 *
 * Cada tabla lleva su fuente citable — el reporte se las muestra al dueño
 * del negocio en el desplegable "¿Cómo calculamos esto?", así que nunca se
 * presentan como datos exactos de SU negocio, sino como benchmarks públicos
 * de la industria combinados con datos reales (posición real, volumen real
 * de Google Ads, ticket real según su price_level de Google).
 */

// CTR orgánico por posición. Fuente: estudios de CTR por posición en Google
// (blended de estudios públicos tipo Backlinko / Advanced Web Ranking).
// Son promedios de comportamiento de búsqueda en general, no específicos de
// México ni del rubro restaurantero — se presentan como benchmark, no como
// medición exacta.
export const CTR_ORGANICO_POR_POSICION: Record<number, number> = {
  1: 0.276,
  2: 0.158,
  3: 0.11,
  4: 0.08,
  5: 0.059,
  6: 0.045,
  7: 0.035,
  8: 0.028,
  9: 0.023,
  10: 0.02,
}
export const CTR_ORGANICO_11_A_20 = 0.01
export const CTR_ORGANICO_SIN_RANKEAR = 0

// CTR del Local Pack (mapa) por posición. Fuente: estudios de local SEO
// (ej. Whitespark / BrightLocal) sobre el comportamiento de clics en el
// bloque de 3 negocios con mapa que Google muestra para búsquedas locales.
export const CTR_MAPA_POR_POSICION: Record<number, number> = {
  1: 0.176,
  2: 0.085,
  3: 0.065,
}
export const CTR_MAPA_SIN_PACK = 0

/**
 * % de clics que se convierten en una visita/cliente real.
 * Fuente: benchmarks de "intención de búsqueda local" (ej. Google reporta
 * que ~76% de quienes buscan algo cercano visitan un negocio en 24h; ~28%
 * de búsquedas locales terminan en una compra). Usamos un valor
 * conservador dentro de ese rango.
 */
export const CONVERSION_CLICK_A_VISITA = 0.28

/** Personas promedio por mesa/pedido. Estándar de la industria restaurantera. */
export const PERSONAS_POR_MESA = 4

/**
 * Ticket promedio por persona (MXN) según el price_level de Google Places
 * (0-4). Si el negocio no tiene price_level configurado en Google, se usa
 * el default y se marca como "estimado" en el reporte.
 */
export const TICKET_POR_PRICE_LEVEL: Record<number, number> = {
  1: 150,
  2: 300,
  3: 600,
  4: 1200,
}
export const TICKET_DEFAULT_MXN = 300

/**
 * Factor conservador: el volumen de búsqueda de Google Ads que usamos es a
 * nivel PAÍS (México), no colonia/ciudad del negocio — no toda esa demanda
 * es alcanzable para un solo negocio. Nos quedamos deliberadamente cortos
 * para que el número final sea imposible de tumbar ("hasta le bajamos a la
 * mitad para ser justos").
 */
export const FACTOR_CONSERVADOR = 0.5

/**
 * FRENTE A — Captura ponderada por nivel de zona.
 *
 * La misma demanda ("cerveza") se busca a 3 niveles geográficos, pero entre
 * más amplia la zona, MENOS de esa demanda le toca realmente a un solo
 * negocio (el que busca "cerveza CDMX" puede estar del otro lado de la
 * ciudad). Ponderamos la pérdida de cada keyword por el nivel de su zona:
 *  - colonia: 1.0  (tu cliente natural, a la vuelta)
 *  - alcaldía: 0.40 (parte cae en tu radio, parte no)
 *  - ciudad: 0.04  (una fracción mínima llega hasta ti)
 */
export const ZONE_WEIGHTS = {
  colonia: 1.0,
  alcaldia: 0.4,
  ciudad: 0.04,
} as const

export type ZoneLevel = keyof typeof ZONE_WEIGHTS

/**
 * FRENTE B — Multiplicador de redes (ESTIMADO, no medido).
 *
 * La base Google es medida e imposible de tumbar. Encima estimamos el
 * negocio que se pierde en redes (Instagram, TikTok, Facebook) con UN solo
 * multiplicador fijo, igual para todas las redes, aplicado AL FINAL sobre la
 * base sana — NUNCA antes. Se presenta SIEMPRE separado del número medido.
 */
export const MULTIPLICADOR_REDES = 4

/**
 * FRENTE B — Techo físico. Manda sobre el ×4: por muy alto que dé el
 * estimado de redes, un negocio no puede facturar más de lo que físicamente
 * cabe. Techo = factorTamaño × turnos/día × días/mes × ticket, con clamp.
 *
 * `factorTamano` NO es aforo real: es un proxy de "qué tan establecido/
 * concurrido" está el negocio, medido por su # de reseñas (las reseñas miden
 * antigüedad y tráfico, no capacidad física). Solo sirve para orden de
 * magnitud. La precisión real vendría de preguntarle el aforo al dueño.
 */
export const TURNOS_POR_DIA = 2
export const DIAS_OPERACION_MES = 26
export const FACTOR_TAMANO_BASE = 40
export const FACTOR_TAMANO_MAX = 120
export const RESENAS_POR_UNIDAD_TAMANO = 25
export const TECHO_MIN_MXN = 500_000
export const TECHO_MAX_MXN = 3_000_000
