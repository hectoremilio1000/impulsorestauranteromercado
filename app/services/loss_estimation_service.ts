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
} from '#config/loss_estimation'

export type VolumeQueryInput = {
  query: string
  searchVolume: number | null
  mapPack: { targetRank: number | null }
  organic: { targetRank: number | null }
}

export type LossBreakdownItem = {
  query: string
  searchVolume: number
  gapOrganico: number
  gapMapa: number
  clicsPerdidos: number
}

export type LossEstimate = {
  estimatedMonthlyLoss: number
  ticket: number
  clicsPerdidosTotal: number
  visitasPerdidas: number
  breakdown: LossBreakdownItem[]
  // Constantes usadas en este cálculo, para que el frontend pueda mostrar
  // el desglose completo sin duplicar "números mágicos" en dos lugares.
  conversionClickAVisita: number
  personasPorMesa: number
  factorConservador: number
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

/**
 * Estima la pérdida de ventas mensual combinando datos reales (volumen de
 * búsqueda de Google Ads + posición real en mapa/orgánico + ticket promedio
 * según price_level de Google) con benchmarks públicos de CTR/conversión
 * (ver config/loss_estimation.ts, cada uno con su fuente citada).
 *
 * El número crece sólo cuando los datos reales son grandes (mucho volumen
 * de búsqueda + ticket alto + muy abajo en varias frases) — no hay ningún
 * multiplicador inventado para "inflar" el resultado.
 */
export function estimarPerdidaMensual(
  volumeQueries: VolumeQueryInput[],
  priceLevel: number | null
): LossEstimate {
  const ticket =
    (priceLevel !== null ? TICKET_POR_PRICE_LEVEL[priceLevel] : undefined) ?? TICKET_DEFAULT_MXN

  const breakdown: LossBreakdownItem[] = []
  let clicsPerdidosTotal = 0

  for (const q of volumeQueries) {
    const searchVolume = q.searchVolume ?? 0
    if (searchVolume <= 0) continue

    const gapOrganico = Math.max(
      0,
      CTR_ORGANICO_POR_POSICION[1] - ctrOrganico(q.organic.targetRank)
    )
    const gapMapa = Math.max(0, CTR_MAPA_POR_POSICION[1] - ctrMapa(q.mapPack.targetRank))

    const clicsPerdidos = searchVolume * (gapOrganico + gapMapa)
    clicsPerdidosTotal += clicsPerdidos

    breakdown.push({
      query: q.query,
      searchVolume,
      gapOrganico,
      gapMapa,
      clicsPerdidos,
    })
  }

  const visitasPerdidas = clicsPerdidosTotal * CONVERSION_CLICK_A_VISITA
  const perdidaBruta = visitasPerdidas * PERSONAS_POR_MESA * ticket
  const estimatedMonthlyLoss = Math.round(perdidaBruta * FACTOR_CONSERVADOR)

  return {
    estimatedMonthlyLoss,
    ticket,
    clicsPerdidosTotal,
    visitasPerdidas,
    breakdown,
    conversionClickAVisita: CONVERSION_CLICK_A_VISITA,
    personasPorMesa: PERSONAS_POR_MESA,
    factorConservador: FACTOR_CONSERVADOR,
  }
}
