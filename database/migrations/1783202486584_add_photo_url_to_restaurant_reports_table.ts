import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('photo_url', 1000).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('photo_url')
    })
  }
}
