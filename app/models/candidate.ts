import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Answer from './answer.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Company from './company.js'
import Position from './position.js'

export default class Candidate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare whatsapp: string

  @column()
  declare email: string

  @column({ columnName: 'cv_path' })
  declare cv_path: string | null

  @column()
  declare comments: string | null

  @column({ columnName: 'position_id' })
  declare positionId: number

  // 1) Tu nueva columna
  @column({ columnName: 'company_id' })
  declare companyId: number | null // FK → companies.id (puede ser null)

  @column({ columnName: 'reference1_company' })
  declare reference1Company: string

  @column({ columnName: 'reference1_position' })
  declare reference1Position: string

  @column({ columnName: 'reference1_name' })
  declare reference1Name: string

  @column({ columnName: 'reference1_timeworked' })
  declare reference1Timeworked: string

  @column({ columnName: 'reference1_whatsapp' })
  declare reference1Whatsapp: string

  @column({ columnName: 'reference2_company' })
  declare reference2Company: string

  @column({ columnName: 'reference2_position' })
  declare reference2Position: string

  @column({ columnName: 'reference2_name' })
  declare reference2Name: string

  @column({ columnName: 'reference2_timeworked' })
  declare reference2Timeworked: string

  @column({ columnName: 'reference2_whatsapp' })
  declare reference2Whatsapp: string

  @column()
  declare status: 'To Review' | 'Start Exam' | 'Exam Completed' | 'Approved' | 'Discarded'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Answer, {
    foreignKey: 'candidate_id',
  })
  declare answers: HasMany<typeof Answer>

  @belongsTo(() => Company, { foreignKey: 'companyId' })
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Position, { foreignKey: 'positionId' })
  declare position: BelongsTo<typeof Position>
}
