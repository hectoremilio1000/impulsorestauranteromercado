// app/validators/auth.ts
import vine from '@vinejs/vine'

const password = vine.string().minLength(8)

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().unique(async (db, value, field) => {
      const user = await db
        .from('users')
        .whereNot('id', field.meta.userId)
        .where('email', value)
        .first()
      return !user
    }),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password,
  })
)
