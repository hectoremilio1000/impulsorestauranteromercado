import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const base = {
  order: vine.number().positive(),
}

const headingBlock = vine.object({
  ...base,
  type: vine.literal('heading'),
  text: vine.string().minLength(1),
})

const paragraphBlock = vine.object({
  ...base,
  type: vine.literal('paragraph'),
  text: vine.string().minLength(1),
})

const imageBlock = vine.object({
  ...base,
  type: vine.literal('image'),
  imageUrl: vine.string().url(),
})

const BlockSchema = vine
  .union([
    vine.union.if((v) => v?.type === 'heading', headingBlock),
    vine.union.if((v) => v?.type === 'paragraph', paragraphBlock),
    vine.union.if((v) => v?.type === 'image', imageBlock),
  ])
  .otherwise((_, field) => {
    field.report('Tipo de bloque desconocido', 'unknown_block', field)
  })

export const createBlogPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(5),
    slug: vine
      .string()
      .regex(/^[a-z0-9-]+$/)
      .toLowerCase()
      .optional(),
    excerpt: vine.string().maxLength(255).optional(),
    coverImage: vine.string().url().optional(),
    bannerPhrase: vine.string().optional(),

    publishedAt: vine.any().transform((value) => {
      if (!value) return null
      const parsed = DateTime.fromJSDate(new Date(value))
      return parsed.isValid ? parsed : null
    }),

    authorId: vine.number().positive(),
    blocks: vine.array(BlockSchema).minLength(1),
  })
)
