import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { sendEmail } from '#services/resend_mailer'
import RecommendationGenerator from '#services/recommendation_generator'
import { buildRespuestasTextoFromDb } from '#services/survey_responses_text'
import { surveyIntakeValidator } from '#validators/survey_intake'

import Prospect from '#models/prospect'
import Response from '#models/response'
import Recommendation from '#models/recommendation'
import fs from 'node:fs/promises'

type ProspectPayload = {
  first_name?: string
  last_name?: string
  email?: string
  whatsapp?: string
  status?: string
  origin?: string
}

function normalizeProspectPayload(payload: ProspectPayload) {
  const firstNameRaw = String(payload.first_name ?? '').trim()
  const lastNameRaw = String(payload.last_name ?? '').trim()

  let firstName = firstNameRaw
  let lastName = lastNameRaw

  // If the frontend sends a full name in first_name, split it safely.
  if (!lastName && firstNameRaw) {
    const parts = firstNameRaw.split(/\s+/).filter(Boolean)
    if (parts.length > 1) {
      firstName = parts.shift() || firstNameRaw
      lastName = parts.join(' ')
    }
  }

  if (!firstName) {
    firstName = 'Prospecto'
  }

  // DB column is NOT NULL; use a safe fallback when surname is missing.
  if (!lastName) {
    lastName = '-'
  }

  return {
    first_name: firstName,
    last_name: lastName,
    email: String(payload.email ?? '')
      .trim()
      .toLowerCase(),
    whatsapp: String(payload.whatsapp ?? '').trim(),
    status: String(payload.status ?? '').trim() || 'nuevo',
    origin: String(payload.origin ?? '').trim() || 'growthsuite-foodbot',
  }
}

@inject()
export default class ProspectsController {
  constructor(private recommendationGenerator: RecommendationGenerator) {}

  public async index({}: HttpContext) {
    try {
      const prospects = await Prospect.all()
      return {
        status: 'success',
        code: 200,
        message: 'Prospects fetched succesfully',
        data: prospects,
      }
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: 'Error fetching prospects',
        error: error.message,
      }
    }
  }

  public async show({ params }: HttpContext) {
    try {
      const prospect = await Prospect.findOrFail(params.id)
      return {
        status: 'success',
        code: 200,
        message: 'Operation successful',
        data: prospect,
      }
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: 'An error occurred',
        error: error.message,
      }
    }
  }

  public async store({ request }: HttpContext) {
    try {
      const data = request.only([
        'first_name',
        'last_name',
        'email',
        'whatsapp',
        'status',
        'origin',
      ])
      const prospect = await Prospect.create(data)

      return {
        status: 'success',
        code: 200,
        message: 'Operation successful',
        data: prospect,
      }
    } catch (error) {
      console.error(error)
      return {
        status: 'error',
        code: 500,
        message: 'An error occurred',
        error: error.message,
      }
    }
  }
  public async storeMeeting({ request }: HttpContext) {
    try {
      const data = request.only([
        'first_name',
        'last_name',
        'email',
        'whatsapp',
        'status',
        'origin',
      ])
      console.log('Datos recibidos:', data)

      const prospect = await Prospect.create(data)

      await sendEmail({
        to: data.email,
        subject: 'Impulso Restaurantero: Nos pondremos en contacto pronto para el meeting',
        html: `
          <html>
            <body>
              <h1>¡Gracias por tu interés en nuestros servicios!</h1>
              <p>Hola, ${data.first_name} ${data.last_name},</p>
              <p>
                Hemos recibido tu solicitud y nos pondremos en contacto contigo para coordinar una reunión presencial o virtual y ayudarte a potenciar tu restaurante con nuestros servicios.
              </p>
              <p>¡Estamos emocionados de ayudarte!</p>
              <p>Atentamente,</p>
              <p>El equipo de Impulso Restaurantero</p>
            </body>
          </html>
        `,
      })

      return {
        status: 'success',
        code: 200,
        message: 'Prospecto creado y correo enviado exitosamente.',
        data: prospect,
      }
    } catch (error) {
      console.error('Error en storeMeeting:', error)
      return {
        status: 'error',
        code: 500,
        message: 'Error al crear el prospecto o enviar el correo.',
        error: error.message,
      }
    }
  }

  public async storeWithRecommendations({ request, response }: HttpContext) {
    try {
      // I-3: validación ESTRUCTURAL (no de contenido). 422 solo si `responses` viene
      // pero no es un array usable. Los datos del lead se normalizan abajo, nunca se
      // rechazan (no perder leads reales por validación estricta).
      const { responses } = await request.validateUsing(surveyIntakeValidator)

      // Normalización: reusa normalizeProspectPayload (nombre/apellido/email) y aplica
      // whatsapp -> solo dígitos (últimos 10) + defaults propios de la encuesta.
      const rawData = request.only([
        'first_name',
        'last_name',
        'email',
        'whatsapp',
        'status',
        'origin',
      ])
      const normalized = normalizeProspectPayload(rawData)
      const prospectData = {
        ...normalized,
        whatsapp: normalized.whatsapp.replace(/\D/g, '').slice(-10),
        origin: String(rawData.origin ?? '').trim() || 'inteligenciaArtificial',
        status: String(rawData.status ?? '').trim() || 'creado',
      }

      const prospect = await Prospect.create(prospectData)

      // Solo generamos recomendación si hay respuestas; si no, igual respondemos 200.
      let recommendation: Recommendation | null = null
      if (responses && responses.length > 0) {
        await Response.createMany(
          responses.map((resp) => ({ prospect_id: prospect.id, option_id: resp.option_id }))
        )

        // Texto para la IA resuelto DESDE la DB (option_id -> texto real, agrupado por
        // pregunta). Así la IA recibe "Oficinistas, Familias", no "44, 45".
        const respuestasTexto = await buildRespuestasTextoFromDb(prospect.id)

        const recomendaciones = await this.recommendationGenerator.generate({
          firstName: prospectData.first_name,
          lastName: prospectData.last_name,
          respuestasTexto,
        })

        recommendation = await Recommendation.create({
          prospect_id: prospect.id,
          text: recomendaciones,
        })

        // Email best-effort: si Resend falla, NO tumbamos la respuesta al usuario
        // (el prospecto y la recomendación ya quedaron guardados).
        try {
          await sendEmail({
            to: prospectData.email,
            subject: 'Recomendaciones de Impulso Restaurantero',
            html: `
            <h1>¡Gracias por tus respuestas, ${prospectData.first_name}!</h1>
            <p>Estas son nuestras recomendaciones personalizadas para tu restaurante:</p>
            <pre>${recomendaciones}</pre>
          `,
          })
        } catch (mailError) {
          console.error('Error enviando email de recomendaciones:', mailError)
        }
      }

      // C-2: responder SIEMPRE (aunque no haya responses ni recomendación) -> nunca undefined.
      return response.status(200).json({
        status: 'success',
        message: recommendation
          ? 'Prospecto creado y recomendaciones enviadas exitosamente.'
          : 'Prospecto creado exitosamente.',
        data: { prospect, recommendation },
      })
    } catch (error) {
      // Errores de validación estructural (VineJS) -> 422
      if (error?.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          status: 'error',
          message: 'Datos de la encuesta inválidos.',
          errors: error.messages,
        })
      }
      console.error('Error en storeWithRecommendations:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al procesar la solicitud.',
        error: error.message,
      })
    }
  }
  public async storeWebSite({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'first_name',
        'last_name',
        'email',
        'whatsapp',
        'status',
        'origin',
      ])
      console.log('Datos recibidos:', data) // Verifica que `status` esté presente aquí

      // Crear el prospecto en la base de datos
      const prospect = await Prospect.create(data)

      // Ruta del PDF que será enviado como adjunto
      const pdfPath = app.makePath(
        'public/pdf/Estudio_de_3_Restaurantes_que_Triunfan_a_lo_Grande.pdf'
      )

      // Enviar el correo con el contenido directamente
      const pdfBuffer = await fs.readFile(pdfPath)
      await sendEmail({
        to: data.email,
        subject: 'Impulso Restaurantero: Estudio de casos exitosos',
        html: `
          <html>
            <body>
              <h1>¡Gracias por tu interés en nuestros estudios de casos exitosos!</h1>
              <p>Hola, ${data.first_name} ${data.last_name},</p>
              <p>
                Adjuntamos un archivo PDF con el estudio de 33 restaurantes exitosos para que puedas inspirarte y lograr el éxito en tu negocio.
              </p>
              <p>¡Éxito!</p>
            </body>
          </html>
        `,
        attachments: [
          {
            filename: 'Estudio_de_3_Restaurantes_que_Triunfan_a_lo_Grande.pdf',
            content: pdfBuffer.toString('base64'),
          },
        ],
      })

      // Respuesta de éxito
      return response.created({
        status: 'success',
        message: 'Prospecto creado y correo enviado exitosamente.',
        data: prospect,
      })
    } catch (error) {
      console.error('Error en storeWebSite:', error)
      return response.internalServerError({
        status: 'error',
        message: 'Error al crear el prospecto o enviar el correo.',
        error: error.message,
      })
    }
  }
  public async storeGrowthsuite({ request }: HttpContext) {
    try {
      const payload = request.only([
        'first_name',
        'last_name',
        'email',
        'whatsapp',
        'status',
        'origin',
      ]) as ProspectPayload

      const data = normalizeProspectPayload(payload)

      const prospect = await Prospect.create(data)

      await sendEmail({
        to: data.email,
        subject: 'Growthsuite: Gracias por tu interés',
        from: 'Growthsuite <clientes@growthsuite.com.mx>',
        apiKey: env.get('RESEND_API_KEY_GROWTHSUITE'),
        html: `
          <div style="margin:0;padding:32px;background:#f5f7fb;font-family: 'Inter', Arial, sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">
              <tr>
                <td style="padding:28px 32px;background:linear-gradient(135deg,#1d85f4,#4da3ff);color:#ffffff;">
                  <h1 style="margin:0;font-size:24px;font-weight:700;">Growthsuite</h1>
                  <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Plataforma todo en uno para restaurantes</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;color:#0b1220;">
                  <p style="margin:0 0 16px;font-size:16px;">Hola ${data.first_name},</p>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;">
                    Gracias por tu interés. Hemos recibido tu solicitud y en breve un especialista de Growthsuite se pondrá en contacto contigo para agendar una demo.
                  </p>
                  <div style="margin:24px 0;">
                    <span style="display:inline-block;padding:10px 16px;border-radius:999px;background:#eef5ff;color:#1d85f4;font-size:13px;font-weight:600;">Solicitud recibida</span>
                  </div>
                  <p style="margin:0;font-size:14px;color:#6b7280;">Mientras tanto, si necesitas algo adicional, responde este correo.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px;background:#0b1220;color:#e5e7eb;font-size:12px;text-align:center;">
                  Growthsuite · clientes@growthsuite.com.mx
                </td>
              </tr>
            </table>
          </div>
        `,
      })

      return {
        status: 'success',
        code: 200,
        message: 'Prospecto creado y correo enviado exitosamente.',
        data: prospect,
      }
    } catch (error) {
      console.error('Error en storeGrowthsuite:', error)
      return {
        status: 'error',
        code: 500,
        message: 'Error al crear el prospecto o enviar el correo.',
        error: error.message,
      }
    }
  }
}
