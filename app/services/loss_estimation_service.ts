import {
  CTR_ORGANICO_POR_POSICION,
  CTR_ORGANICO_11_A_20,
  CTR_ORGANICO_SIN_RANKEAR,
  CTR_MAPA_POR_POSICION,
  CTR_MAPA_SIN_PACK,
  CONVERSION_CLICK_A_VISITA,
  PERSONAS_POR_MESA,
  TICKET_POR_PRICE_LEVEL,
  TICKET_DEFAULT_MXN,
  FACTOR_CONSERVADOR,
  MULTIPLICADOR_REDES,
  UMBRAL_MEDIDO_GRANDE_MXN,
  MULTIPLICADOR_REDES_GRANDE,
  TURNOS_POR_DIA,
  DIAS_OPERACION_MES,
  FACTOR_TAMANO_BASE,
  FACTOR_TAMANO_MAX,
  RESENAS_POR_UNIDAD_TAMANO,
  TECHO_MIN_MXN,
  TECHO_MAX_MXN,
  type ZoneLevel,
} from '#config/loss_estimation'

export type VolumeQueryInput = {
  query: string
  searchVolume: number | null
  mapPack: { targetRank: number | null }
  organic: { targetRank: number | null }
  // FRENTE A: nivel de zona (colonia/alcaldía/ciudad) y su peso de captura.
  // Opcionales para compatibilidad; si faltan, peso = 1 (sin ponderar).
  zone?: ZoneLevel
  weight?: number
}

export type LossBreakdownItem = {
  query: string
  zone: ZoneLevel | null
  weight: number
  searchVolume: number
  organicRank: number | null
  mapRank: number | null
  gapOrganico: number
  gapMapa: number
  clicsPerdidos: number // crudo, sin ponderar por zona
  clicsPerdidosPonderados: number
  perdidaPonderada: number // $ que aporta esta keyword a la base medida
}

export type LossEstimate = {
  // ── FRENTE A: base Google, MEDIDA (imposible de tumbar) ──
  googleMedido: number

  // ── FRENTE B: envoltura ESTIMADA (etiquetada como tal) ──
  multiplicadorRedes: number
  conRedes: number // googleMedido × multiplicador (antes del techo)
  factorTamano: number
  techoFisico: number
  cappedPorTecho: boolean
  loQueDejasHoy: number // = min(conRedes, techo), nunca < googleMedido  ← headline
  estimadoRedes: number // = loQueDejasHoy − googleMedido (la parte de redes)

  // ── detalle / transparencia ──
  ticket: number
  clicsPerdidosTotal: number // ponderado
  visitasPerdidas: number
  breakdown: LossBreakdownItem[]
  conversionClickAVisita: number
  personasPorMesa: number
  factorConservador: number

  // Compat: el headline persistido (= loQueDejasHoy).
  estimatedMonthlyLoss: number
}

function ctrOrganico(rank: number | null): number {
  if (rank === null) return CTR_ORGANICO_SIN_RANKEAR
  if (rank <= 10) return CTR_ORGANICO_POR_POSICION[rank] ?? CTR_ORGANICO_SIN_RANKEAR
  if (rank <= 20) return CTR_ORGANICO_11_A_20
  return CTR_ORGANICO_SIN_RANKEAR
}

function ctrMapa(rank: number | null): number {
  if (rank === null) return CTR_MAPA_SIN_PACK
  return CTR_MAPA_POR_POSICION[rank] ?? CTR_MAPA_SIN_PACK
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Estima la pérdida de ventas mensual en 2 capas (ver ESTADO_SESION_IMPULSO §1):
 *
 * FRENTE A — base Google MEDIDA: combina datos reales (volumen de Google Ads +
 * posición real + ticket por price_level) con benchmarks públicos de CTR/
 * conversión. Cada keyword se pondera por el nivel de su zona (colonia 1.0,
 * alcaldía 0.40, ciudad 0.04): la misma demanda vale menos entre más amplia la
 * zona. El orden es sagrado: se construye la base sana ANTES de cualquier
 * envoltura.
 *
 * FRENTE B — envoltura ESTIMADA: sobre la base sana se aplica UN multiplicador
 * de redes (×4) al final, acotado por un techo físico (factorTamaño × turnos ×
 * días × ticket). El resultado se presenta SIEMPRE separado: "Google (medido)
 * $X + estimado redes $Y = $Z".
 */
export function estimarPerdidaMensual(
  volumeQueries: VolumeQueryInput[],
  priceLevel: number | null,
  reviews: number | null = null
): LossEstimate {
  const ticket =
    (priceLevel !== null ? TICKET_POR_PRICE_LEVEL[priceLevel] : undefined) ?? TICKET_DEFAULT_MXN

  const breakdown: LossBreakdownItem[] = []
  let clicsPerdidosTotal = 0

  // $ por click perdido ponderado (constante entre keywords): permite calcular
  // la aportación en $ de cada keyword para el desglose.
  const mxnPorClick = CONVERSION_CLICK_A_VISITA * PERSONAS_POR_MESA * ticket * FACTOR_CONSERVADOR

  for (const q of volumeQueries) {
    const searchVolume = q.searchVolume ?? 0
    if (searchVolume <= 0) continue

    const weight = q.weight ?? 1
    const gapOrganico = Math.max(
      0,
      CTR_ORGANICO_POR_POSICION[1] - ctrOrganico(q.organic.targetRank)
    )
    const gapMapa = Math.max(0, CTR_MAPA_POR_POSICION[1] - ctrMapa(q.mapPack.targetRank))

    const clicsPerdidos = searchVolume * (gapOrganico + gapMapa)
    const clicsPerdidosPonderados = clicsPerdidos * weight
    clicsPerdidosTotal += clicsPerdidosPonderados

    breakdown.push({
      query: q.query,
      zone: q.zone ?? null,
      weight,
      searchVolume,
      organicRank: q.organic.targetRank,
      mapRank: q.mapPack.targetRank,
      gapOrganico,
      gapMapa,
      clicsPerdidos,
      clicsPerdidosPonderados,
      perdidaPonderada: Math.round(clicsPerdidosPonderados * mxnPorClick),
    })
  }

  const visitasPerdidas = clicsPerdidosTotal * CONVERSION_CLICK_A_VISITA
  const googleMedido = Math.round(clicsPerdidosTotal * mxnPorClick)

  // ── FRENTE B ──
  // factorTamaño: proxy de "qué tan concurrido" por # de reseñas (NO aforo real).
  const factorTamano = clamp(
    Math.round(FACTOR_TAMANO_BASE + (reviews ?? 0) / RESENAS_POR_UNIDAD_TAMANO),
    FACTOR_TAMANO_BASE,
    FACTOR_TAMANO_MAX
  )
  const techoFisico = clamp(
    factorTamano * TURNOS_POR_DIA * DIAS_OPERACION_MES * ticket,
    TECHO_MIN_MXN,
    TECHO_MAX_MXN
  )
  // Grandes (base medida > umbral) usan un multiplicador menor para no toparse
  // todos en el techo y verse iguales.
  const multiplicadorRedes =
    googleMedido > UMBRAL_MEDIDO_GRANDE_MXN ? MULTIPLICADOR_REDES_GRANDE : MULTIPLICADOR_REDES
  const conRedes = googleMedido * multiplicadorRedes
  // El techo manda sobre el multiplicador, pero el headline nunca baja de la
  // base MEDIDA (esa es "imposible de tumbar").
  const loQueDejasHoy = Math.max(googleMedido, Math.min(conRedes, techoFisico))
  const estimadoRedes = Math.max(0, loQueDejasHoy - googleMedido)
  const cappedPorTecho = conRedes > techoFisico

  return {
    googleMedido,
    multiplicadorRedes,
    conRedes,
    factorTamano,
    techoFisico,
    cappedPorTecho,
    loQueDejasHoy,
    estimadoRedes,
    ticket,
    clicsPerdidosTotal,
    visitasPerdidas,
    breakdown,
    conversionClickAVisita: CONVERSION_CLICK_A_VISITA,
    personasPorMesa: PERSONAS_POR_MESA,
    factorConservador: FACTOR_CONSERVADOR,
    estimatedMonthlyLoss: loQueDejasHoy,
  }
}
