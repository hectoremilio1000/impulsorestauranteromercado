import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Tarea async de DataForSEO reviews (se dispara en store) y su resultado
      // cacheado (las peores reseñas recientes), que se recoge en show cuando
      // la tarea ya terminó.
      table.string('reviews_task_id').nullable()
      table.json('worst_reviews').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reviews_task_id')
      table.dropColumn('worst_reviews')
    })
  }
}
