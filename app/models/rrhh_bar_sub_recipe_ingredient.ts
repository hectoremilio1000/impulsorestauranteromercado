import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import BarSubRecipe from './rrhh_bar_sub_recipe.js'
import RecipeUnit from './recipe_unit.js'

export default class BarSubRecipeIngredient extends BaseModel {
  public static table = 'rrhh_bar_sub_recipe_ingredients'

  @column({ isPrimary: true }) declare id: number
  @column() declare bar_sub_recipe_id: number
  @column() declare product: string
  @column() declare amount: number
  @column() declare unit_id: number | null
  @column() declare order: number

  @belongsTo(() => BarSubRecipe, { foreignKey: 'bar_sub_recipe_id' })
  declare subRecipe: BelongsTo<typeof BarSubRecipe>

  @belongsTo(() => RecipeUnit, { foreignKey: 'unit_id' })
  declare unit: BelongsTo<typeof RecipeUnit>
}
