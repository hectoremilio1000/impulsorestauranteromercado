// app/Controllers/Http/RrhhChecklistsController.ts
import RrhhChecklist from '#models/rrhh_checklist'

import { HttpContext } from '@adonisjs/core/http'

export default class RrhhChecklistsController {
  public async index({ request }: HttpContext) {
    const query = RrhhChecklist.query().preload('items').orderBy('created_at', 'desc')

    if (request.input('companyId')) query.where('company_id', request.input('companyId'))
    if (request.input('positionId')) query.where('position_id', request.input('positionId'))
    if (request.input('type')) query.where('type', request.input('type'))

    return { status: 'success', data: await query }
  }

  public async show({ params }: HttpContext) {
    const checklist = await RrhhChecklist.findOrFail(params.id)
    await checklist.load('items')
    return { status: 'success', data: checklist }
  }

  public async store({ request }: HttpContext) {
    const { title, content, type, companyId, positionId, items } = request.only([
      'title',
      'content',
      'type',
      'companyId',
      'positionId',
      'items', // array de { task, order }
    ])

    const checklist = await RrhhChecklist.create({ title, content, type, companyId, positionId })

    if (items && Array.isArray(items)) {
      await checklist.related('items').createMany(items)
    }

    return { status: 'success', data: checklist }
  }

  public async update({ params, request }: HttpContext) {
    const checklist = await RrhhChecklist.findOrFail(params.id)
    const { title, content, type, items } = request.only(['title', 'content', 'type', 'items'])

    checklist.merge({ title, content, type })
    await checklist.save()

    if (items) {
      // estrategia simple: borrar y volver a crear
      await checklist.related('items').query().delete()
      await checklist.related('items').createMany(items)
    }

    await checklist.load('items')
    return { status: 'success', data: checklist }
  }

  public async destroy({ params }: HttpContext) {
    const checklist = await RrhhChecklist.findOrFail(params.id)
    await checklist.delete()
    return { status: 'success' }
  }
}
