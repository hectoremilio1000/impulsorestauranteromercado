/**
 * Reenvía leads (formularios "demo gratis", reporte de IA) hacia pos_tracking_api
 * como conversiones, para que aparezcan en el mismo dashboard de leads que ya usa
 * Centro de Control (POS) — sin esto, estos leads quedan aislados en esta DB MySQL
 * y no se pueden cruzar con la atribución de campaña (lead_uid) ni verse junto a
 * los leads de booking.
 *
 * Best-effort: si pos_tracking_api no responde, NO debe tumbar la respuesta al
 * usuario final — el prospecto ya quedó guardado en esta DB de todos modos.
 */

const TRACKING_API_URL = process.env.TRACKING_API_URL || ''
const TRACKING_API_SERVICE_TOKEN = process.env.TRACKING_API_SERVICE_TOKEN || ''

type ConversionInput = {
  leadUid?: string | null
  eventName: 'lead_form' | 'ai_report_lead'
  name?: string | null
  email?: string | null
  phone?: string | null
  externalId?: string | null
  meta?: Record<string, unknown>
}

export async function reportConversionToTracking(input: ConversionInput): Promise<void> {
  if (!TRACKING_API_URL) {
    console.warn(
      '[tracking_api_service] TRACKING_API_URL no configurado — no se reenvía esta conversión.'
    )
    return
  }

  const payload = {
    lead_uid: input.leadUid || undefined,
    site: 'impulso',
    event_name: input.eventName,
    name: input.name || undefined,
    email: input.email || undefined,
    phone: input.phone || undefined,
    external_id: input.externalId || undefined,
    meta: input.meta || {},
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${TRACKING_API_URL.replace(/\/$/, '')}/api/conversions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-token': TRACKING_API_SERVICE_TOKEN,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(
        `[tracking_api_service] pos_tracking_api respondió ${res.status} para event_name=${input.eventName}:`,
        body?.slice(0, 300)
      )
    }
  } catch (err) {
    console.error('[tracking_api_service] no se pudo reportar la conversión:', err)
  }
}
