import { BaseSchema } from '@adonisjs/lucid/schema'

export default class BlogPosts extends BaseSchema {
  protected tableName = 'blog_posts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('slug').notNullable().unique()
      table.text('excerpt')
      table.string('cover_image')
      table.string('banner_phrase')
      table.text('content', 'longtext').notNullable()

      table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('published_at').nullable()
      table.timestamps(true) // created_at & updated_at
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
