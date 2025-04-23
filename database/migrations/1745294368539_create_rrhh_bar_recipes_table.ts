import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RrhhBarRecipes extends BaseSchema {
  protected tableName = 'rrhh_bar_recipes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table
        .integer('company_id')
        .unsigned()
        .references('id')
        .inTable('companies')
        .onDelete('SET NULL')
      table.string('photo_url')
      table.text('procedure')
      table.integer('version').defaultTo(1)
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
