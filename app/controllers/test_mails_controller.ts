import type { HttpContext } from '@adonisjs/core/http'
import { sendEmail } from '#services/resend_mailer'

export default class TestMailsController {
  public async index({ request }: HttpContext) {
    const data = request.only(['email', 'message']) // Asume que estos campos existen
    console.log(data)

    try {
      await sendEmail({
        to: data.email,
        subject: data.message,
        html: `<p>${data.message}</p>`,
      })

      return {
        status: 'success',
        code: 200,
        message: 'Mensaje enviado correctamente',
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        code: 500,
        message: 'Error  send email',
        error: error.message,
      }
    }
  }
  public async forwordPassword({ request }: HttpContext) {
    const data = request.only(['email', 'message']) // Asume que estos campos existen
    console.log(data)

    try {
      await sendEmail({
        to: data.email,
        subject: data.message,
        html: `<p>${data.message}</p>`,
      })

      return {
        status: 'success',
        code: 200,
        message: 'Mensaje enviado correctamente',
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        code: 500,
        message: 'Error  send email',
        error: error.message,
      }
    }
  }
}
