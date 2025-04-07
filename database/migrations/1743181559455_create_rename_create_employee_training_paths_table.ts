import { BaseSchema } from '@adonisjs/lucid/schema'

export default class RenameemployeeTabletrainingEmployee extends BaseSchema {
  public async up() {
    this.schema.renameTable('employee_training_paths', 'training_employee_paths')
  }

  public async down() {
    // revertir el cambio
    this.schema.renameTable('training_employee_paths', 'employee_training_paths')
  }
}
