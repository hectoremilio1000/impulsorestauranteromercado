import axios from 'axios'
import env from '#start/env'

const BASE = 'https://api.dataforseo.com/v3/business_data/google/reviews'
const LOCATION_MEXICO = 2484

function dfsAuth() {
  return {
    username: env.get('DATAFORSEO_LOGIN'),
    password: env.get('DATAFORSEO_PASSWORD'),
  }
}

export type WorstReview = {
  authorName: string
  rating: number
  timeAgo: string | null
  timestamp: string | null
  text: string
  profileImageUrl: string | null
  reviewUrl: string | null
}

/**
 * Dispara (async) la tarea de reseñas de Google vía DataForSEO, ordenadas por
 * más recientes (para luego filtrar las peores recientes). Es task-based y
 * tarda ~1-2 min, por eso se dispara en `store` y se recoge después en `show`.
 * Devuelve el task_id, o null si falló (best-effort: el reporte no depende de
 * las reseñas para generarse).
 */
export async function postWorstReviewsTask(placeId: string): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${BASE}/task_post`,
      [
        {
          place_id: placeId,
          location_code: LOCATION_MEXICO,
          language_code: 'es',
          sort_by: 'newest',
          // Traemos 70 reseñas recientes para tener suficientes malas de dónde
          // escoger (luego filtramos ≤3★ y ordenamos por rating + recencia).
          depth: 70,
          priority: 2,
        },
      ],
      { auth: dfsAuth(), timeout: 15000 }
    )
    return data?.tasks?.[0]?.id ?? null
  } catch (error) {
    console.error('Error creando tarea de reseñas (DataForSEO):', error?.message ?? error)
    return null
  }
}

/**
 * Recoge la tarea. Si YA terminó, devuelve las peores reseñas recientes (rating
 * ≤ 3 y con texto, las más críticas primero). Si aún NO está lista, devuelve
 * `null` (para reintentar en el siguiente `show`). Si terminó pero no hay malas
 * con texto, devuelve `[]` (cacheable, no reintentar).
 */
export async function getWorstReviews(taskId: string, limit = 4): Promise<WorstReview[] | null> {
  try {
    const { data } = await axios.get(`${BASE}/task_get/${taskId}`, {
      auth: dfsAuth(),
      timeout: 15000,
    })
    const task = data?.tasks?.[0]
    // status_code 20000 = tarea terminada. Cualquier otro = aún en cola / error
    // → null para reintentar.
    if (task?.status_code !== 20000) return null

    const items = (task?.result?.[0]?.items ?? []) as any[]
    if (!Array.isArray(items)) return []

    return items
      .filter(
        (r) =>
          r?.rating?.value != null &&
          r.rating.value <= 3 &&
          (r.review_text ?? '').trim().length >= 15
      )
      // Prioriza por RATING (las más críticas primero) y, a igual rating, por
      // RECENCIA (la más nueva primero).
      .sort((a, b) => {
        if (a.rating.value !== b.rating.value) return a.rating.value - b.rating.value
        return String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? ''))
      })
      .slice(0, limit)
      .map((r) => ({
        authorName: r.profile_name ?? 'Cliente',
        rating: r.rating.value,
        timeAgo: r.time_ago ?? null,
        timestamp: r.timestamp ?? null,
        text: r.review_text ?? '',
        profileImageUrl: r.profile_image_url ?? null,
        reviewUrl: r.review_url ?? null,
      }))
  } catch (error) {
    console.error('Error obteniendo reseñas (DataForSEO):', error?.message ?? error)
    return null
  }
}
