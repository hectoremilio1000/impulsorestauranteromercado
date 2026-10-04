import vine from '@vinejs/vine'

export const createRestaurantReportValidator = vine.compile(
  vine.object({
    place_id: vine.string().trim().minLength(1),
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
