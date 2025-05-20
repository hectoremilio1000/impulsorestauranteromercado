// app/validators/blog_post_validator.ts
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

/* ───────────────── Bloques ───────────────── */

const base = {
  order: vine.number().positive(),
}

/** heading */
const headingBlock = vine.object({
  ...base,
  type: vine.literal('heading'),
  text: vine.string().minLength(1),
})

/** paragraph */
const paragraphBlock = vine.object({
  ...base,
  type: vine.literal('paragraph'),
  text: vine.string().minLength(1),
})

/** image */
const imageBlock = vine.object({
  ...base,
  type: vine.literal('image'),
  imageUrl: vine.string().url(),
})

/**
 * Unión: se valida contra uno de los tres esquemas
 * según el valor de `type`.
 */
const BlockSchema = vine
  .union([
    vine.union.if((v) => v?.type === 'heading', headingBlock),
    vine.union.if((v) => v?.type === 'paragraph', paragraphBlock),
    vine.union.if((v) => v?.type === 'image', imageBlock),
  ])
  .otherwise((_, field) => {
    field.report('Tipo de bloque desconocido', 'unknown_block', field)
  })

/* ───────────────── Post completo ───────────────── */

export const createBlogPostValidator = vine.compile(
  vine.object({
    /* metadatos */
    title: vine.string().trim().minLength(5),
    slug: vine
      .string()
      .regex(/^[a-z0-9-]+$/)
      .toLowerCase()
      .optional(),
    excerpt: vine.string().maxLength(255).optional(),
    coverImage: vine.string().url().optional(),
    bannerPhrase: vine.string().optional(),
    publishedAt: vine
      .date()
      .transform((d: Date) => DateTime.fromJSDate(d))
      .optional(),

    /* contenido */
    blocks: vine.array(BlockSchema).minLength(1),
  })
)
