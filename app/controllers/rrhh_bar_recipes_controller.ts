import type { HttpContext } from '@adonisjs/core/http'
import BarRecipe from '#models/rrhh_bar_recipe'
import BarRecipeIngredient from '#models/rrhh_bar_recipe_ingredient'
import BarSubRecipe from '#models/rrhh_bar_sub_recipe'
import BarSubRecipeIngredient from '#models/rrhh_bar_sub_recipe_ingredient'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class RrhhBarRecipesController {
  // GET /api/bar-recipes
  public async index({ request }: HttpContext) {
    const companyId = request.qs().company_id
    const q = BarRecipe.query()
      .preload('ingredients')
      .preload('subRecipes', (sr) => sr.preload('ingredients'))
    if (companyId) q.where('company_id', companyId)
    return q
  }

  // GET /api/bar-recipes/:id
  public async show({ params }: HttpContext) {
    return BarRecipe.query()
      .where('id', params.id)
      .preload('ingredients')
      .preload('subRecipes', (sr) => sr.preload('ingredients'))
      .firstOrFail()
  }

  // POST /api/bar-recipes  (multipart/form-data)
  public async store({ request, response }: HttpContext) {
    try {
      const {
        name,
        procedure,
        companyId,
        version,
        ingredients = [],
        subRecipes = [],
      } = request.all()

      /* 1.Foto */
      const photo = request.file('photo', {
        size: '5mb',
        extnames: ['jpg', 'png', 'webp'],
      })
      let photoUrl: string | null = null
      if (photo) {
        await photo.move(app.makePath('storage/uploads/bar_recipes'), {
          name: `${cuid()}.${photo.extname}`,
        })
        photoUrl = `storage/uploads/bar_recipes/${photo.fileName}`
      }

      /* 2.Crear receta */
      const recipe = await BarRecipe.create({
        name,
        procedure,
        company_id: companyId || null,
        version: version || 1,
        photo_url: photoUrl,
        is_active: true,
      })

      /* 3. Ingredientes */
      for (const [idx, ing] of ingredients.entries()) {
        await BarRecipeIngredient.create({
          bar_recipe_id: recipe.id,
          product: ing.product,
          amount: ing.amount,
          unit_id: ing.unit_id,
          order: idx,
        })
      }

      /* 4. Sub‑recetas + ingredientes */
      for (const [srIdx, sr] of subRecipes.entries()) {
        const sub = await BarSubRecipe.create({
          bar_recipe_id: recipe.id,
          name: sr.name,
          procedure: sr.procedure,
          order: srIdx,
        })
        for (const [idx, si] of (sr.subIngredients ?? []).entries()) {
          await BarSubRecipeIngredient.create({
            bar_sub_recipe_id: sub.id,
            product: si.product,
            amount: si.amount,
            unit_id: si.unit_id,
            order: idx,
          })
        }
      }

      return this.show({ params: { id: recipe.id } } as any)
    } catch (error) {
      console.error(error)
      return response.internalServerError('No se pudo crear la receta')
    }
  }

  // PUT /api/bar-recipes/:id (solo básicos)
  public async update({ params, request, response }: HttpContext) {
    const recipe = await BarRecipe.findOrFail(params.id)
    recipe.merge(request.only(['name', 'procedure', 'version', 'is_active']))
    await recipe.save()
    return this.show({ params } as any)
  }

  // DELETE /api/bar-recipes/:id
  public async destroy({ params, response }: HttpContext) {
    const recipe = await BarRecipe.findOrFail(params.id)
    await recipe.delete()
    return response.noContent()
  }
}
