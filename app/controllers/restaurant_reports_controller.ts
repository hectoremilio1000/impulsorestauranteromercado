import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import RestaurantReport from '#models/restaurant_report'
import RestaurantReportLead from '#models/restaurant_report_lead'
import {
  createRestaurantReportValidator,
  createRestaurantReportLeadValidator,
} from '#validators/restaurant_report'
import * as googlePlaces from '#services/google_places_service'
import { scoreLocalListings, scoreLabel } from '#services/restaurant_report_scoring_service'
import { scrapeWebsite } from '#services/website_scraper_service'
import { getMobilePageSpeed } from '#services/pagespeed_service'
import { scoreSeo, scoreGuestExperience } from '#services/website_scoring_service'
import { buildLeadConfirmationEmailHtml } from '#mails/restaurant_report_lead_email'
import {
  buildLocalSearchQueries,
  buildWeightedVolumeQueries,
} from '#services/local_search_queries_service'
import type { ZoneLevel } from '#config/loss_estimation'
import { checkLocalRanking, type LocalRankingResult } from '#services/dataforseo_service'
import { getSearchVolumes } from '#services/dataforseo_keyword_volume_service'
import { estimarPerdidaMensual } from '#services/loss_estimation_service'
import { verifyRecaptcha } from '#services/recaptcha_service'
import { resolveSearchCompetitors } from '#services/search_competitors_service'
import { postWorstReviewsTask, getWorstReviews } from '#services/google_reviews_service'

const REPORT_FRESHNESS_HOURS = 24

export default class RestaurantReportsController {
  public async autocomplete({ request, response }: HttpContext) {
    const rawInput = request.input('input', '')
    const input = (Array.isArray(rawInput) ? rawInput.join(', ') : String(rawInput ?? '')).trim()

    if (!input) {
      return response.ok({ status: 'success', predictions: [] })
    }

    try {
      const predictions = await googlePlaces.autocomplete(input)
      return response.ok({ status: 'success', predictions })
    } catch (error) {
      console.error('Error en RestaurantReportsController.autocomplete:', error)
      return response.internalServerError({
        status: 'error',
        message: 'No se pudo conectar con Google Places. Revisa GOOGLE_PLACES_API_KEY.',
        error: error.message,
      })
    }
  }

  /**
   * Preview rápido (sólo Google Places, sin scraping/PageSpeed) para
   * alimentar la animación de "escaneo" en el frontend mientras el reporte
   * completo se genera en paralelo.
   */
  public async preview({ request, response }: HttpContext) {
    const placeId = String(request.input('place_id', '') ?? '').trim()

    if (!placeId) {
      return response.badRequest({ status: 'error', message: 'Falta place_id.' })
    }

    try {
      const details = await googlePlaces.getPlaceDetails(placeId)
      const location = details.geometry?.location

      const [competitors, photos] = await Promise.all([
        location
          ? googlePlaces.getNearbyCompetitors(location, placeId).catch((error) => {
              console.error('Error obteniendo competidores cercanos (preview):', error)
              return []
            })
          : Promise.resolve([]),
        Promise.all(
          details.photoReferences.slice(0, 9).map((ref) => googlePlaces.resolvePhotoUrl(ref, 480))
        ).then((urls) => urls.filter((url): url is string => Boolean(url))),
      ])

      return response.ok({
        status: 'success',
        data: {
          name: details.name,
          formatted_address: details.formatted_address,
          rating: details.rating,
          user_ratings_total: details.user_ratings_total,
          types: details.types,
          location: location ?? null,
          photos,
          reviews: details.reviews,
          competitors,
        },
      })
    } catch (error) {
      console.error('Error en RestaurantReportsController.preview:', error)
      return response.internalServerError({
        status: 'error',
        message: 'No se pudo obtener el preview. Revisa GOOGLE_PLACES_API_KEY.',
        error: error.message,
      })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const { place_id: placeId } = await request.validateUsing(createRestaurantReportValidator)

      const existing = await RestaurantReport.query().where('place_id', placeId).first()
      const isFresh =
        existing &&
        existing.updatedAt &&
        DateTime.now().diff(existing.updatedAt, 'hours').hours < REPORT_FRESHNESS_HOURS

      if (existing && isFresh) {
        return response.ok({ status: 'success', data: existing })
      }

      const details = await googlePlaces.getPlaceDetails(placeId)
      const location = details.geometry?.location

      const competitors = location
        ? await googlePlaces.getNearbyCompetitors(location, placeId).catch((error) => {
            console.error('Error obteniendo competidores cercanos:', error)
            return []
          })
        : []

      const { score: scoreLocal, issues } = scoreLocalListings(details)

      let websiteScrapeError: string | null = null
      let scrape = null as Awaited<ReturnType<typeof scrapeWebsite>> | null
      let mobilePerformanceScore: number | null = null
      let serpQueries: LocalRankingResult[] = []
      let serpRankingError: string | null = null
      let photoUrl: string | null = null
      let volumeQueryResults: (LocalRankingResult & {
        searchVolume: number | null
        zone?: ZoneLevel
        weight?: number
      })[] = []
      let volumeQueryError: string | null = null
      let reviewsTaskId: string | null = null

      const parallelTasks: Promise<void>[] = []

      // Dispara (async, best-effort) la tarea de reseñas de DataForSEO. Tarda
      // ~1-2 min, así que sólo guardamos el task_id ahora y las peores reseñas
      // se recogen después en `show` (cuando el usuario ya llegó al reporte).
      parallelTasks.push(
        postWorstReviewsTask(placeId)
          .then((id) => {
            reviewsTaskId = id
          })
          .catch(() => {})
      )

      if (details.photoReferences.length > 0) {
        parallelTasks.push(
          googlePlaces
            .resolvePhotoUrl(details.photoReferences[0], 480)
            .then((url) => {
              photoUrl = url
            })
            .catch((error) => {
              console.error('Error resolviendo foto principal:', error)
            })
        )
      }

      if (details.website) {
        const website = details.website
        parallelTasks.push(
          (async () => {
            const [scrapeResult, pageSpeedResult] = await Promise.allSettled([
              scrapeWebsite(website),
              getMobilePageSpeed(website),
            ])

            if (scrapeResult.status === 'fulfilled') {
              scrape = scrapeResult.value
            } else {
              console.error('Error escaneando el sitio web:', scrapeResult.reason)
              websiteScrapeError =
                'No pudimos leer tu sitio web (puede que tu proveedor esté bloqueando el análisis).'
            }

            if (pageSpeedResult.status === 'fulfilled') {
              mobilePerformanceScore = pageSpeedResult.value.mobilePerformanceScore
            } else {
              console.error('Error obteniendo PageSpeed:', pageSpeedResult.reason)
            }
          })()
        )
      }

      const localSearchQueries = buildLocalSearchQueries(details)

      if (location && localSearchQueries.length > 0) {
        parallelTasks.push(
          (async () => {
            const results = await Promise.allSettled(
              localSearchQueries.map((query) =>
                checkLocalRanking(query, location, details.website, details.name)
              )
            )

            const fulfilled = results.filter(
              (result): result is PromiseFulfilledResult<LocalRankingResult> =>
                result.status === 'fulfilled'
            )

            if (fulfilled.length === 0) {
              console.error('Error en todas las consultas SERP:', results)
              serpRankingError =
                'No pudimos revisar tu posición en búsquedas locales en este momento.'
            }

            serpQueries = fulfilled.map((result) => result.value)
          })()
        )
      }

      // FRENTE A: keywords = SOLO lo que el negocio vende (semillas de
      // concepto) × 3 niveles de zona (colonia/alcaldía/ciudad) con captura
      // ponderada. Cada query trae su peso; medimos posición Y volumen de las
      // MISMAS frases para que el cálculo de pérdida combine datos consistentes.
      const weightedQueries = buildWeightedVolumeQueries(details)
      const volumeQueryStrings = weightedQueries.map((q) => q.query)
      const weightByQuery = new Map(weightedQueries.map((q) => [q.query, q]))

      if (location && weightedQueries.length > 0) {
        parallelTasks.push(
          (async () => {
            // Volumen PRIMERO: solo medimos posición (SERP, la llamada cara) de
            // las frases con demanda real. Las semillas con 0 volumen no aportan
            // a la pérdida y gastarían SERP en balde — confirmado en pruebas
            // reales (ej. "tragos {zona}" da 0 en Google Ads). Descartarlas aquí
            // ahorra costo por reporte sin cambiar el resultado.
            const volumeMap = await getSearchVolumes(volumeQueryStrings).catch((error) => {
              console.error('Error obteniendo volumen de búsqueda:', error)
              return new Map<string, number | null>()
            })

            const withVolume = weightedQueries.filter((q) => (volumeMap.get(q.query) ?? 0) > 0)

            if (withVolume.length === 0) {
              volumeQueryError = 'No encontramos volumen de búsqueda medible para tu zona.'
              return
            }

            const serpResults = await Promise.allSettled(
              withVolume.map((q) =>
                checkLocalRanking(q.query, location, details.website, details.name)
              )
            )

            const fulfilled = serpResults.filter(
              (result): result is PromiseFulfilledResult<LocalRankingResult> =>
                result.status === 'fulfilled'
            )

            if (fulfilled.length === 0) {
              console.error('Error en todas las consultas SERP de volumen:', serpResults)
              volumeQueryError = 'No pudimos revisar tu posición en este momento.'
            }

            volumeQueryResults = fulfilled.map((result) => {
              const weighted = weightByQuery.get(result.value.query)
              return {
                ...result.value,
                searchVolume: volumeMap.get(result.value.query) ?? null,
                zone: weighted?.zone,
                weight: weighted?.weight ?? 1,
              }
            })
          })()
        )
      }

      await Promise.all(parallelTasks)

      // Competidores de BÚSQUEDA con coords para el mapa (Fase 2). No se persiste
      // (evita migración): va solo en la respuesta del store, que es lo que el
      // scan usa para el mapa.
      const searchCompetitors = await resolveSearchCompetitors(
        serpQueries,
        competitors,
        location ?? null,
        details.name
      ).catch((error) => {
        console.error('Error resolviendo competidores de búsqueda:', error)
        return []
      })

      const lossEstimate = estimarPerdidaMensual(
        volumeQueryResults,
        details.price_level,
        details.user_ratings_total
      )

      const { score: scoreSeoResult, issues: seoIssues } = scoreSeo(details, scrape)
      const { score: scoreGuestResult, issues: guestIssues } = scoreGuestExperience(
        details,
        scrape,
        mobilePerformanceScore
      )

      const scoreTotal = scoreLocal + scoreSeoResult + scoreGuestResult

      const payload = {
        place_id: placeId,
        name: details.name,
        formatted_address: details.formatted_address,
        phone: details.formatted_phone_number,
        website: details.website,
        has_website: Boolean(details.website),
        rating: details.rating,
        user_ratings_total: details.user_ratings_total,
        price_level: details.price_level,
        service_options: {
          dine_in: details.dine_in,
          takeout: details.takeout,
          delivery: details.delivery,
        },
        opening_hours: details.opening_hours,
        categories: details.types,
        score_local_listings: scoreLocal,
        issues,
        competitors,
        raw_place_details: details.raw,
        score_seo: scoreSeoResult,
        score_guest_experience: scoreGuestResult,
        score_total: scoreTotal,
        score_label: scoreLabel(scoreTotal),
        pagespeed_mobile_score: mobilePerformanceScore,
        seo_issues: seoIssues,
        guest_experience_issues: guestIssues,
        website_scrape_error: websiteScrapeError,
        serp_queries: serpQueries,
        serp_ranking_error: serpRankingError,
        search_competitors: searchCompetitors,
        photo_url: photoUrl,
        volume_queries: volumeQueryResults,
        volume_query_error: volumeQueryError,
        estimated_monthly_loss: lossEstimate.estimatedMonthlyLoss,
        loss_breakdown: lossEstimate,
        reviews_task_id: reviewsTaskId,
        worst_reviews: null,
      }

      const report = existing
        ? await (async () => {
            existing.merge(payload)
            await existing.save()
            return existing
          })()
        : await RestaurantReport.create(payload)

      return response.created({ status: 'success', data: report })
    } catch (error) {
      console.error('Error en RestaurantReportsController.store:', error)
      return response.internalServerError({
        status: 'error',
        message: 'No se pudo generar el reporte. Revisa GOOGLE_PLACES_API_KEY o intenta de nuevo.',
        error: error.message,
      })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const report = await RestaurantReport.find(params.id)

      if (!report) {
        return response.notFound({ status: 'error', message: 'Reporte no encontrado.' })
      }

      // La liga del reporte caduca tras REPORT_FRESHNESS_HOURS. Si expiró, NO
      // devolvemos los datos (ni por la liga del correo) — solo el flag `expired`,
      // para que el usuario tenga que volver a generar el reporte.
      const ageHours = DateTime.now().diff(report.createdAt, 'hours').hours
      if (ageHours > REPORT_FRESHNESS_HOURS) {
        return response.ok({
          status: 'success',
          data: { id: report.id, name: report.name, expired: true },
        })
      }

      const hasLead = await this.reportHasLead(report.id)

      // Recoge las peores reseñas si la tarea async de DataForSEO ya terminó y
      // aún no están cacheadas. Si sigue en cola, no bloquea (se reintenta en la
      // siguiente carga del reporte).
      if (report.worst_reviews == null && report.reviews_task_id) {
        const worst = await getWorstReviews(report.reviews_task_id).catch(() => null)
        if (worst != null) {
          report.worst_reviews = worst
          await report.save()
        }
      }

      return response.ok({ status: 'success', data: { ...report.serialize(), hasLead, expired: false } })
    } catch (error) {
      console.error('Error en RestaurantReportsController.show:', error)
      return response.internalServerError({
        status: 'error',
        message: 'No se pudo obtener el reporte.',
        error: error.message,
      })
    }
  }

  public async createLead({ params, request, response }: HttpContext) {
    try {
      const report = await RestaurantReport.find(params.id)

      if (!report) {
        return response.notFound({ status: 'error', message: 'Reporte no encontrado.' })
      }

      const data = await request.validateUsing(createRestaurantReportLeadValidator)

      // Verificar el captcha "No soy un robot" (server-side) antes de guardar.
      // No hay rate-limit a propósito: un mismo usuario puede enviar sus datos
      // varias veces; cada envío es un lead válido.
      const captchaOk = await verifyRecaptcha(data.captchaToken, request.ip())
      if (!captchaOk) {
        return response.badRequest({
          status: 'error',
          message: 'Verificación de "No soy un robot" fallida. Intenta de nuevo.',
        })
      }

      const lead = await RestaurantReportLead.create({
        restaurant_report_id: report.id,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
      })

      const reportUrl = `${env.get('FRONTEND_URL')}/reporte-ai/resultado?id=${report.id}`

      await mail
        .send((message) => {
          message
            .to(data.email)
            .from(env.get('SMTP_FROM'))
            .subject(`Impulso Restaurantero: tu reporte de ${report.name} está listo`)
            .html(buildLeadConfirmationEmailHtml({ data, report, reportUrl }))
        })
        .catch((error) => {
          console.error('Error enviando correo de confirmación del lead:', error)
        })

      return response.created({ status: 'success', data: lead })
    } catch (error) {
      if (error?.code === 'E_VALIDATION_ERROR') {
        return response.unprocessableEntity({
          status: 'error',
          message: 'Datos inválidos.',
          errors: error.messages,
        })
      }
      console.error('Error en RestaurantReportsController.createLead:', error)
      return response.internalServerError({
        status: 'error',
        message: 'No se pudo guardar tus datos. Intenta de nuevo.',
        error: error.message,
      })
    }
  }

  /**
   * Un reporte ya "desbloqueado" (con lead guardado) debe verse completo
   * desde cualquier dispositivo/navegador, no sólo desde el que hizo el
   * desbloqueo original (eso vivía sólo en localStorage del navegador).
   */
  private async reportHasLead(reportId: number): Promise<boolean> {
    const count = await RestaurantReportLead.query()
      .where('restaurant_report_id', reportId)
      .count('* as total')
    return Number(count[0].$extras.total) > 0
  }
}
