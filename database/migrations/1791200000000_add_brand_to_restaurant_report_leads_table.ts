import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurant_report_leads'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Qué sitio capturó este lead. Va en el LEAD y no en el reporte porque el
      // reporte se deduplica por place_id a nivel global: si Impulso ya analizó un
      // restaurante y después lo busca alguien desde Growthsuite, se reutiliza la
      // MISMA fila. El reporte no pertenece a nadie; el lead sí.
      //
      // Default 'impulso' y notNullable: las filas que ya existen —todas de
      // Impulso— quedan correctamente etiquetadas sin tocarlas, y cualquier
      // petición que no mande el campo se comporta igual que antes.
      table.string('brand', 32).notNullable().defaultTo('impulso')
      table.index(['brand'], 'rrl_brand_idx')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['brand'], 'rrl_brand_idx')
      table.dropColumn('brand')
    })
  }
}
