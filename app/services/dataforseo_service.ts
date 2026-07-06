import axios from 'axios'
import env from '#start/env'

const BASE_URL = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced'

function extractHostname(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export type LocalRankingResult = {
  query: string
  mapPack: {
    targetRank: number | null
    topResults: { name: string; rating: number | null }[]
  }
  organic: {
    targetRank: number | null
    topResult: { title: string | null; domain: string | null } | null
  }
}

/**
 * Corre una búsqueda local en Google (vía DataForSEO, endpoint Live) y
 * regresa en qué posición aparece el negocio objetivo tanto en el "local
 * pack" (mapa) como en resultados orgánicos, además de quién está arriba.
 */
export async function checkLocalRanking(
  query: string,
  location: { lat: number; lng: number },
  targetWebsite: string | null,
  targetName: string
): Promise<LocalRankingResult> {
  const targetHostname = extractHostname(targetWebsite)

  const { data } = await axios.post(
    BASE_URL,
    [
      {
        keyword: query,
        language_code: 'es',
        location_coordinate: `${location.lat},${location.lng},15`,
        device: 'mobile',
        os: 'android',
        depth: 20,
      },
    ],
    {
      auth: {
        username: env.get('DATAFORSEO_LOGIN'),
        password: env.get('DATAFORSEO_PASSWORD'),
      },
      timeout: 20000,
    }
  )

  const task = data?.tasks?.[0]
  if (task?.status_code && task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task.status_code} ${task.status_message ?? ''}`)
  }

  const items = (task?.result?.[0]?.items ?? []) as any[]

  // Cada negocio del "local pack" (mapa) es su propio ítem con
  // type:'local_pack' (no un contenedor con una lista anidada), cada uno
  // trae su propio domain/url — igual que los orgánicos.
  //
  // Usamos rank_group (posición SOLO dentro de su propio tipo de resultado)
  // en vez de rank_absolute (posición contando TODO en la página: mapa,
  // video, "también se buscó", preguntas frecuentes, etc.). rank_absolute
  // infla el número — confirmado con datos reales: un negocio que es el 4to
  // resultado orgánico real (rank_group=4) aparecía como "#10" o "#11" con
  // rank_absolute, porque contaba de más los 3 del mapa + otros bloques que
  // no son resultados de verdad. rank_group es lo que un humano cuenta
  // contando "1er link azul, 2do link azul...".
  const localPackBusinesses = items
    .filter((item) => item.type === 'local_pack')
    .sort((a, b) => (a.rank_group ?? 0) - (b.rank_group ?? 0))

  let mapPackTargetRank: number | null = null
  const mapPackMatchByDomain = targetHostname
    ? localPackBusinesses.find((business) => {
        const domain = extractHostname(business.url) ?? business.domain
        return domain && String(domain).toLowerCase().includes(targetHostname.toLowerCase())
      })
    : null

  if (mapPackMatchByDomain) {
    mapPackTargetRank = mapPackMatchByDomain.rank_group ?? null
  } else {
    // Sin sitio web (o no coincidió), intenta por nombre del negocio.
    const mapPackMatchByName = localPackBusinesses.find((business) => {
      const businessName = String(business.title ?? '').toLowerCase()
      return (
        businessName &&
        (businessName.includes(targetName.toLowerCase()) ||
          targetName.toLowerCase().includes(businessName))
      )
    })
    mapPackTargetRank = mapPackMatchByName?.rank_group ?? null
  }

  const organicItems = items
    .filter((item) => item.type === 'organic')
    .sort((a, b) => (a.rank_group ?? 0) - (b.rank_group ?? 0))

  let organicTargetRank: number | null = null
  if (targetHostname) {
    const match = organicItems.find((item) => {
      const domain = extractHostname(item.url) ?? item.domain
      return domain && String(domain).toLowerCase().includes(targetHostname.toLowerCase())
    })
    if (match) {
      organicTargetRank = match.rank_group ?? null
    }
  }

  const topOrganic = organicItems[0]

  return {
    query,
    mapPack: {
      targetRank: mapPackTargetRank,
      topResults: localPackBusinesses.slice(0, 3).map((business) => ({
        name: business.title ?? 'Desconocido',
        rating: business.rating?.value ?? null,
      })),
    },
    organic: {
      targetRank: organicTargetRank,
      topResult: topOrganic
        ? {
            title: topOrganic.title ?? null,
            domain: extractHostname(topOrganic.url) ?? topOrganic.domain ?? null,
          }
        : null,
    },
  }
}
