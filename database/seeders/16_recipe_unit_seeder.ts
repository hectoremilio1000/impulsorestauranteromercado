import { BaseSeeder } from '@adonisjs/lucid/seeders'
import RecipeUnit from '#models/recipe_unit'

export default class extends BaseSeeder {
  public async run() {
    await RecipeUnit.updateOrCreateMany('name', [
      { name: 'oz' },
      { name: 'ml' },
      { name: 'hojas' },
      { name: 'unidad' },
    ])
  }
}
