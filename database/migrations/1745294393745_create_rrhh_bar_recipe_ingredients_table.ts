import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RrhhBarRecipeIngredients extends BaseSchema {
  protected tableName = 'rrhh_bar_recipe_ingredients'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('bar_recipe_id')
        .unsigned()
        .references('id')
        .inTable('rrhh_bar_recipes')
        .onDelete('CASCADE')
      table.string('product').notNullable()
      table.decimal('amount', 10, 3).notNullable()
      table
        .integer('unit_id')
        .unsigned()
        .references('id')
        .inTable('recipe_units')
        .onDelete('SET NULL')
      table.integer('order').defaultTo(0)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
