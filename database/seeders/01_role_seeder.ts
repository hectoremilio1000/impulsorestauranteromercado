// database/seeders/Role.ts

import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    // Verifica si existe un rol con 'name' = 'superadmin'; si no, lo crea
    await Role.firstOrCreate(
      { name: 'superadmin' },
      {
        /* campos adicionales */
      }
    )

    await Role.firstOrCreate(
      { name: 'administrador' },
      {
        /* campos adicionales */
      }
    )

    await Role.firstOrCreate(
      { name: 'prospect' },
      {
        /* campos adicionales */
      }
    )

    await Role.firstOrCreate(
      { name: 'employee' },
      {
        /* campos adicionales */
      }
    )
  }
}
