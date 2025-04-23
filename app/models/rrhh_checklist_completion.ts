// app/Models/RrhhChecklistCompletion.ts
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'
import RrhhChecklistItem from './rrhh_checklist_item.js'

export default class RrhhChecklistCompletion extends BaseModel {
  public static table = 'rrhh_checklist_completions'

  @column({ isPrimary: true }) declare id: number
  @column({ columnName: 'employee_id' }) declare employeeId: number
  @column({ columnName: 'item_id' }) declare itemId: number
  @column() declare date: string // guardaremos '2025-04-20'
  @column() declare done: boolean

  @belongsTo(() => Employee) declare employee: BelongsTo<typeof Employee>
  @belongsTo(() => RrhhChecklistItem, { foreignKey: 'item_id' })
  declare item: BelongsTo<typeof RrhhChecklistItem>

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
}
