import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('volume_queries').nullable()
      table.string('volume_query_error', 500).nullable()
      table.bigInteger('estimated_monthly_loss').nullable()
      table.json('loss_breakdown').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('volume_queries')
      table.dropColumn('volume_query_error')
      table.dropColumn('estimated_monthly_loss')
      table.dropColumn('loss_breakdown')
    })
  }
}
