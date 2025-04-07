// database/seeders/Role.ts
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    // Creamos múltiples registros
    await Role.createMany([
      {
        id: 1,
        name: 'superadmin',
      },
      {
        id: 2,
        name: 'administrador',
      },
      {
        id: 3,
        name: 'prospect',
      },
      {
        id: 4,
        name: 'employee',
      },
    ])
  }
}
