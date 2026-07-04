import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

function jsonColumn() {
  return {
    prepare: (value: unknown) =>
      value === null || value === undefined ? value : JSON.stringify(value),
    consume: (value: unknown) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') return JSON.parse(value)
      return value
    },
  }
}

export default class RestaurantReport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare place_id: string

  @column()
  declare name: string

  @column()
  declare formatted_address: string | null

  @column()
  declare phone: string | null

  @column()
  declare website: string | null

  @column()
  declare has_website: boolean

  @column()
  declare rating: number | null

  @column()
  declare user_ratings_total: number | null

  @column()
  declare price_level: number | null

  @column(jsonColumn())
  declare service_options: Record<string, boolean | null> | null

  @column(jsonColumn())
  declare opening_hours: Record<string, unknown> | null

  @column(jsonColumn())
  declare categories: string[] | null

  @column()
  declare score_local_listings: number

  @column(jsonColumn())
  declare issues: unknown[] | null

  @column(jsonColumn())
  declare competitors: unknown[] | null

  @column(jsonColumn())
  declare raw_place_details: Record<string, unknown> | null

  @column()
  declare score_seo: number

  @column()
  declare score_guest_experience: number

  @column()
  declare score_total: number

  @column()
  declare score_label: string | null

  @column()
  declare pagespeed_mobile_score: number | null

  @column(jsonColumn())
  declare seo_issues: unknown[] | null

  @column(jsonColumn())
  declare guest_experience_issues: unknown[] | null

  @column()
  declare website_scrape_error: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
