// app/models/blog_post_block.ts
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import BlogPost from '#models/blog_post'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class BlogPostBlock extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  /* 👇  esta columna EXISTE en la tabla como post_id */
  @column({ columnName: 'post_id' })
  declare postId: number

  @column()
  declare order: number

  @column()
  declare type: 'heading' | 'paragraph' | 'image'

  @column()
  declare text: string | null

  @column({ columnName: 'image_url' })
  declare imageUrl: string | null

  @belongsTo(() => BlogPost, { foreignKey: 'postId' })
  declare post: BelongsTo<typeof BlogPost>
}
