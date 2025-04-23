// database/migrations/XXXX_create_rrhh_checklist_items.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RrhhChecklistItems extends BaseSchema {
  protected tableName = 'rrhh_checklist_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('checklist_id')
        .unsigned()
        .references('rrhh_checklists.id')
        .onDelete('CASCADE')
        .notNullable()
      table.string('task').notNullable()
      table.integer('order').defaultTo(0) // para re‑ordenar en el front
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
