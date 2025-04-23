import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Company from './company.js'
import Position from './position.js'
import RrhhChecklistItem from './rrhh_checklist_item.js'

export default class RrhhChecklist extends BaseModel {
  /** ← tabla correcta */
  public static table = 'rrhh_checklists'

  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare content: string | null
  @column() declare type: 'opening' | 'intermediate' | 'closing'

  @column({ columnName: 'company_id' }) declare companyId: number | null
  @column({ columnName: 'position_id' }) declare positionId: number | null

  @belongsTo(() => Company) declare company: BelongsTo<typeof Company>
  @belongsTo(() => Position) declare position: BelongsTo<typeof Position>

  @hasMany(() => RrhhChecklistItem, {
    foreignKey: 'checklistId', // propiedad en el hijo
    localKey: 'id', // propiedad en el padre
  })
  declare items: HasMany<typeof RrhhChecklistItem>

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
}
