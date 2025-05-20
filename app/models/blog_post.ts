// app/models/blog_post.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'

import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import BlogPostBlock from './blog_post_block.js'

export default class BlogPost extends BaseModel {
  /* ───────────────────────────────── Primary Key ────────────────────────────── */
  @column({ isPrimary: true })
  declare id: number

  /* ──────────────────────────────── Basic fields ────────────────────────────── */
  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare excerpt: string | null

  @column({ columnName: 'cover_image' })
  declare coverImage: string | null

  @column({ columnName: 'banner_phrase' })
  declare bannerPhrase: string | null

  /**
   * Guarda el HTML/Markdown del artículo.
   * Usa `longtext` en la BD si esperas contenido extenso.
   */
  @column({ serializeAs: null, consume: (v) => v ?? null }) // oculto en JSON
  declare content: string | null

  /* ──────────────────────────── Publicación y autor ─────────────────────────── */
  @column.dateTime({ columnName: 'published_at' })
  declare publishedAt: DateTime | null

  /** FK: user que escribe/publica */
  @column({ columnName: 'author_id' })
  declare authorId: number

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  /* ────────────────────────────────── Timestamps ────────────────────────────── */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => BlogPostBlock, { foreignKey: 'postId' })
  declare blocks: HasMany<typeof BlogPostBlock>
}
