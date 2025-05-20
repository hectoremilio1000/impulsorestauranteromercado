// database/migrations/XXXXXXXX_remove_position_column_from_candidates.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RemovePositionColumnFromCandidates extends BaseSchema {
  protected tableName = 'candidates'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('position')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('position')
    })
  }
}
