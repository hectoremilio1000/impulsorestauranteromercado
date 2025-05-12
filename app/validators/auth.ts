// app/validators/auth.ts
import vine from '@vinejs/vine'

const password = vine.string().minLength(8)

export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value, field) => {
        const query = db.from('users').where('email', value)

        // Solo excluye el ID cuando viene en meta (ej. al editar)
        if (field.meta?.userId) {
          query.whereNot('id', field.meta.userId)
        }

        return !(await query.first())
      }),

    password: vine.string().minLength(8),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password,
  })
)
