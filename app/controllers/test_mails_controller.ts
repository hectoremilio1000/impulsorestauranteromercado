import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

const mailFrom = env.get('SMTP_FROM') || env.get('SMTP_USERNAME')

export default class TestMailsController {
  public async index({ request }: HttpContext) {
    const data = request.only(['email', 'message']) // Asume que estos campos existen
    console.log(data)

    try {
      await mail.send((message) => {
        message.to(data.email).from(mailFrom).subject(data.message)
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
      await mail.send((message) => {
        message.to(data.email).from(mailFrom).subject(data.message)
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
