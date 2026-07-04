import RestaurantReport from '#models/restaurant_report'

const LOGO_URL =
  'https://www.impulsorestaurantero.com/_next/static/media/logoPalabrasFinalImpulsoRestaurantero.4cf72051.png'
const GOLD = '#a78b21'
const BLACK = '#0a0a0a'

type BuildLeadConfirmationEmailInput = {
  data: { name: string; whatsapp: string; email: string }
  report: RestaurantReport
  reportUrl: string
}

export function buildLeadConfirmationEmailHtml({
  data,
  report,
  reportUrl,
}: BuildLeadConfirmationEmailInput): string {
  const pointsReviewed = report.has_website ? 32 : 20

  return `
    <html>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:${BLACK};padding:28px 24px;border-radius:16px 16px 0 0;">
                    <img src="${LOGO_URL}" alt="Impulso Restaurantero" width="220" style="display:block;max-width:220px;height:auto;" />
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#ffffff;padding:32px 28px;border-radius:0 0 16px 16px;">
                    <h1 style="margin:0 0 16px;color:${BLACK};font-size:22px;">¡Gracias, ${data.name}!</h1>
                    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:22px;">
                      Ya tienes acceso completo al reporte AI de <strong>${report.name}</strong>,
                      con el detalle de los ${pointsReviewed} puntos que revisamos y los
                      restaurantes cerca de ti con los que estás compitiendo.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                      <tr>
                        <td align="center" style="background-color:${GOLD};border-radius:10px;">
                          <a href="${reportUrl}" target="_blank" style="display:inline-block;padding:14px 28px;color:${BLACK};font-weight:bold;font-size:15px;text-decoration:none;">
                            Ver mi reporte completo
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:22px;">
                      En breve alguien de nuestro equipo te va a contactar por WhatsApp al
                      <strong>${data.whatsapp}</strong> para ayudarte a resolver los problemas
                      que encontramos.
                    </p>
                    <p style="margin:0;color:#333;font-size:15px;line-height:22px;">
                      ¡Éxito!<br />
                      El equipo de <span style="color:${GOLD};font-weight:bold;">Impulso Restaurantero</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 0;color:#999;font-size:12px;">
                    Impulso Restaurantero · impulsorestaurantero.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
