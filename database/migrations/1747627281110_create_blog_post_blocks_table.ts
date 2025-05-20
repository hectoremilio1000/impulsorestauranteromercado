// database/migrations/XXXXXXXX_blog_post_blocks.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class BlogPostBlocks extends BaseSchema {
  protected tableName = 'blog_post_blocks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('blog_posts').onDelete('CASCADE')

      table.integer('order').unsigned().notNullable()
      table.enum('type', ['heading', 'paragraph', 'image']).notNullable()
      table.text('text') // heading o párrafo
      table.string('image_url') // solo para image
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
