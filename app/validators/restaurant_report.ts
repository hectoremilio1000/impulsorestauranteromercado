import vine from '@vinejs/vine'

export const createRestaurantReportValidator = vine.compile(
  vine.object({
    place_id: vine.string().trim().minLength(1),
    /* Sólo DEV/local: analizar otra URL (p. ej. la vista previa de un sitio
     * corregido) en vez del sitio de la ficha. El controlador la ignora salvo
     * que REPORT_ALLOW_WEBSITE_OVERRIDE=true y NODE_ENV no sea production. */
    website_url: vine.string().trim().url({ protocols: ['http', 'https'], require_tld: false }).optional(),
  })
)

export const createRestaurantReportLeadValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    whatsapp: vine
      .string()
      .trim()
      .regex(/^[0-9]{10,15}$/),
    email: vine.string().trim().email().normalizeEmail(),
    captchaToken: vine.string().trim().minLength(1),
    /* Opcional a propósito: el front de Impulso no lo manda y debe seguir
     * funcionando igual. La normalización y el fail-safe viven en resolveBrand(). */
    brand: vine.string().trim().optional(),
  })
)
