import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_report_leads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('restaurant_report_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('restaurant_reports')
        .onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.string('whatsapp', 20).notNullable()
      table.string('email', 255).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
