// node ace make:migration add_position_fk_to_candidates

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'candidates'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('position_id')
        .unsigned()
        .references('id')
        .inTable('positions')
        .onDelete('SET NULL') // o CASCADE según tu lógica
        .after('email') // ponlo donde prefieras
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('position_id')
    })
  }
}
