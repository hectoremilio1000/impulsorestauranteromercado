import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'
import Employee from '#app/models/employee'
import RrhhChecklist from '#app/models/rrhh_checklist'
import RrhhChecklistCompletion from '#app/models/rrhh_checklist_completion'

export default class EmployeeChecklistsController {
  /**
   * GET /api/checklists/daily
   * Devuelve la plantilla + estado (done true|false) para HOY
   */
  public async daily({ auth }: HttpContext) {
    const user = auth.user!
    const employee = await Employee.query()
      .where('user_id', user.id)
      .preload('position')
      .firstOrFail()

    const today = DateTime.local().toISODate() // '2025-04-20'

    // 1) Traemos todas las plantillas que le aplican

    const templates = await RrhhChecklist.query()
      .where((q) => {
        q.whereNull('company_id')
        if (employee.company_id !== null) {
          q.orWhere('company_id', employee.company_id)
        }
      })
      .where((q) => {
        q.whereNull('position_id')
        if (employee.positionId !== null) {
          q.orWhere('position_id', employee.positionId)
        }
      })
      .preload('items')

    // 2) Para cada item verificamos si ya existe completion
    const itemIds = templates.flatMap((c) => c.items.map((i) => i.id))
    const completions = await RrhhChecklistCompletion.query()
      .where('employee_id', employee.id)
      .whereIn('item_id', itemIds)
      .where('date', today)

    const completionsMap = new Map(completions.map((c) => [c.itemId, c]))

    const result = templates.map((tpl) => ({
      ...tpl.$attributes,
      items: tpl.items.map((it) => ({
        ...it.$attributes,
        done: completionsMap.has(it.id) && completionsMap.get(it.id)!.done,
      })),
    }))

    return { status: 'success', data: result }
  }

  /**
   * POST /api/checklists/complete
   * Body: { itemId, done }  (done=true|false)
   */
  public async complete({ auth, request }: HttpContext) {
    const user = auth.user!
    const employee = await Employee.query().where('user_id', user.id).firstOrFail()
    const { itemId, done } = request.only(['itemId', 'done'])
    const today = DateTime.local().toISODate()

    const completion = await RrhhChecklistCompletion.updateOrCreate(
      { employeeId: employee.id, itemId, date: today },
      { done }
    )

    return { status: 'success', data: completion }
  }
}
