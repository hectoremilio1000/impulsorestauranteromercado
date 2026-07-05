import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('score_seo').notNullable().defaultTo(0)
      table.integer('score_guest_experience').notNullable().defaultTo(0)
      table.integer('score_total').notNullable().defaultTo(0)
      table.string('score_label', 20).nullable()
      table.integer('pagespeed_mobile_score').nullable()
      table.json('seo_issues').nullable()
      table.json('guest_experience_issues').nullable()
      table.string('website_scrape_error', 500).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('score_seo')
      table.dropColumn('score_guest_experience')
      table.dropColumn('score_total')
      table.dropColumn('score_label')
      table.dropColumn('pagespeed_mobile_score')
      table.dropColumn('seo_issues')
      table.dropColumn('guest_experience_issues')
      table.dropColumn('website_scrape_error')
    })
  }
}
