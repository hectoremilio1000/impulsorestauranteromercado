import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RemoveContentFromBlogPosts extends BaseSchema {
  protected tableName = 'blog_posts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('content')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('content', 'longtext').notNullable()
    })
  }
}
