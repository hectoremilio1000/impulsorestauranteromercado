import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RecipeUnits extends BaseSchema {
  protected tableName = 'recipe_units'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
