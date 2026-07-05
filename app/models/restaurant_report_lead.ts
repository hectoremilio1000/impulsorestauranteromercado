import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import RestaurantReport from '#models/restaurant_report'

export default class RestaurantReportLead extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare restaurant_report_id: number

  @column()
  declare name: string

  @column()
  declare whatsapp: string

  @column()
  declare email: string

  @belongsTo(() => RestaurantReport, {
    foreignKey: 'restaurant_report_id',
  })
  declare restaurantReport: BelongsTo<typeof RestaurantReport>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
