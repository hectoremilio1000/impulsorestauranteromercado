import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import BarRecipe from './rrhh_bar_recipe.js'
import RecipeUnit from './recipe_unit.js'

export default class BarRecipeIngredient extends BaseModel {
  public static table = 'rrhh_bar_recipe_ingredients'

  @column({ isPrimary: true }) declare id: number
  @column() declare bar_recipe_id: number
  @column() declare product: string
  @column() declare amount: number
  @column() declare unit_id: number | null
  @column() declare order: number

  @belongsTo(() => BarRecipe, { foreignKey: 'bar_recipe_id' })
  declare recipe: BelongsTo<typeof BarRecipe>

  @belongsTo(() => RecipeUnit, { foreignKey: 'unit_id' })
  declare unit: BelongsTo<typeof RecipeUnit>
}
