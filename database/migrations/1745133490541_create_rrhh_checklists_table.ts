import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RrhhChecklists extends BaseSchema {
  protected tableName = 'rrhh_checklists'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('title').notNullable() // Ej. “Apertura Meseros”
      table.text('content').notNullable() // JSON, Markdown o texto libre

      table.enum('type', ['opening', 'intermediate', 'closing']).notNullable().defaultTo('opening') // Apertura, Intermedio, Cierre

      table
        .integer('company_id')
        .unsigned()
        .references('companies.id')
        .onDelete('CASCADE')
        .nullable()

      table
        .integer('position_id')
        .unsigned()
        .references('positions.id')
        .onDelete('CASCADE')
        .nullable()

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
