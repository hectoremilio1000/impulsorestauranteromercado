// database/migrations/XXXX_create_rrhh_checklist_completions.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RrhhChecklistCompletions extends BaseSchema {
  protected tableName = 'rrhh_checklist_completions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('employee_id')
        .unsigned()
        .references('employees.id')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('item_id')
        .unsigned()
        .references('rrhh_checklist_items.id')
        .onDelete('CASCADE')
        .notNullable()

      table.date('date').notNullable() // YYYY‑MM‑DD
      table.boolean('done').defaultTo(false)

      table.unique(['employee_id', 'item_id', 'date']) // evita duplicados
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
