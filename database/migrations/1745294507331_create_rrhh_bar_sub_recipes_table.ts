import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RrhhBarSubRecipes extends BaseSchema {
  protected tableName = 'rrhh_bar_sub_recipes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('bar_recipe_id')
        .unsigned()
        .references('id')
        .inTable('rrhh_bar_recipes')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('photo_url')
      table.text('procedure')
      table.integer('order').defaultTo(0)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
