import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import BarRecipe from './rrhh_bar_recipe.js'
import BarSubRecipeIngredient from './rrhh_bar_sub_recipe_ingredient.js'

export default class BarSubRecipe extends BaseModel {
  public static table = 'rrhh_bar_sub_recipes'

  @column({ isPrimary: true }) declare id: number
  @column() declare bar_recipe_id: number
  @column() declare name: string
  @column() declare photo_url: string | null
  @column() declare procedure: string | null
  @column() declare order: number

  @belongsTo(() => BarRecipe, { foreignKey: 'bar_recipe_id' })
  declare recipe: BelongsTo<typeof BarRecipe>

  @hasMany(() => BarSubRecipeIngredient, { foreignKey: 'bar_sub_recipe_id' })
  declare ingredients: HasMany<typeof BarSubRecipeIngredient>
}
