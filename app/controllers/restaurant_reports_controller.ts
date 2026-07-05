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
import { buildLocalSearchQueries } from '#services/local_search_queries_service'
import { checkLocalRanking, type LocalRankingResult } from '#services/dataforseo_service'

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

      const parallelTasks: Promise<void>[] = []

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

      await Promise.all(parallelTasks)

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
        photo_url: photoUrl,
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

      const hasLead = await this.reportHasLead(report.id)

      return response.ok({ status: 'success', data: { ...report.serialize(), hasLead } })
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
