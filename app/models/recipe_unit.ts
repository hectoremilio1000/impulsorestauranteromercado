import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import BarRecipeIngredient from './rrhh_bar_recipe_ingredient.js'
import BarSubRecipeIngredient from './rrhh_bar_sub_recipe_ingredient.js'

export default class RecipeUnit extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string

  @hasMany(() => BarRecipeIngredient, { foreignKey: 'unit_id' })
  declare recipeIngredients: HasMany<typeof BarRecipeIngredient>

  @hasMany(() => BarSubRecipeIngredient, { foreignKey: 'unit_id' })
  declare subRecipeIngredients: HasMany<typeof BarSubRecipeIngredient>
}
