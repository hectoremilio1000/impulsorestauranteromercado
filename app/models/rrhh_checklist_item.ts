import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import RrhhChecklist from './rrhh_checklist.js'

export default class RrhhChecklistItem extends BaseModel {
  public static table = 'rrhh_checklist_items'

  @column({ isPrimary: true }) declare id: number
  @column({ columnName: 'checklist_id' }) declare checklistId: number // ← FK
  @column() declare task: string
  @column() declare order: number

  @belongsTo(() => RrhhChecklist, {
    foreignKey: 'checklistId',
    localKey: 'id',
  })
  declare checklist: BelongsTo<typeof RrhhChecklist>

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
}
