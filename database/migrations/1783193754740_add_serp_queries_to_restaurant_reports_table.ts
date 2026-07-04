import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('serp_queries').nullable()
      table.string('serp_ranking_error', 500).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('serp_queries')
      table.dropColumn('serp_ranking_error')
    })
  }
}
