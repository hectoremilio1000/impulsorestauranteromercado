import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('place_id', 255).notNullable().unique()
      table.string('name', 255).notNullable()
      table.string('formatted_address', 255).nullable()
      table.string('phone', 30).nullable()
      table.string('website', 500).nullable()
      table.boolean('has_website').notNullable().defaultTo(false)
      table.float('rating').nullable()
      table.integer('user_ratings_total').nullable()
      table.integer('price_level').nullable()
      table.json('service_options').nullable()
      table.json('opening_hours').nullable()
      table.json('categories').nullable()
      table.integer('score_local_listings').notNullable().defaultTo(0)
      table.json('issues').nullable()
      table.json('competitors').nullable()
      table.json('raw_place_details').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
