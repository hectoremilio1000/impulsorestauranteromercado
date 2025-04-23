import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Company from './company.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import BarRecipeIngredient from './rrhh_bar_recipe_ingredient.js'
import BarSubRecipe from './rrhh_bar_sub_recipe.js'

export default class BarRecipe extends BaseModel {
  public static table = 'rrhh_bar_recipes'

  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare company_id: number | null
  @column() declare photo_url: string | null
  @column() declare procedure: string | null
  @column() declare version: number
  @column() declare is_active: boolean

  @belongsTo(() => Company, { foreignKey: 'company_id' })
  declare company: BelongsTo<typeof Company>

  @hasMany(() => BarRecipeIngredient, { foreignKey: 'bar_recipe_id' })
  declare ingredients: HasMany<typeof BarRecipeIngredient>

  @hasMany(() => BarSubRecipe, { foreignKey: 'bar_recipe_id' })
  declare subRecipes: HasMany<typeof BarSubRecipe>
}
