import vine from '@vinejs/vine'

/**
 * Validación ESTRUCTURAL del intake de la encuesta pública.
 *
 * Filosofía: normalizar > rechazar. Aquí NO se valida contenido de los datos del
 * lead (nombre/email/whatsapp se sanitizan en el controller, nunca se rechazan) —
 * solo se garantiza que `responses`, si viene, tenga una forma usable.
 *
 * - `responses` opcional. Si NO viene o viene vacío -> el controller responde 200
 *   sin recomendación (no cuelga).
 * - Si viene pero NO es un array de objetos con `option_id` numérico positivo ->
 *   VineJS lanza E_VALIDATION_ERROR -> el controller responde 422.
 *
 * Campos extra del item que manda el front (`pregunta`, `opciones`) se ignoran:
 * ya no se usan (el texto se resuelve desde la DB).
 */
export const surveyIntakeValidator = vine.compile(
  vine.object({
    responses: vine
      .array(
        vine.object({
          option_id: vine.number().positive(),
        })
      )
      .optional(),
  })
)
