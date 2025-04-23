// database/seeders/UserSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import Role from '#models/role'

export default class UserSeeder extends BaseSeeder {
  public static developmentOnly = false // se corre en cualquier entorno

  /**
   * Mapeo rápido de ids ↔︎ nombres de rol según tu data:
   * 1 = superadmin | 2 = administrador | 3 = prospect | 4 = employee
   * Asegúrate de que esos roles EXISTAN por tu RoleSeeder.
   */
  private users = [
    // ---- rol_id = 2 (administrador) ----
    {
      name: 'Fake user',
      email: 'impulsorestaurantero@gmail.com',
      roleName: 'administrador',
      isActive: true,
    },
    {
      name: 'Hector',
      email: 'hectoremilio2@hotmail.com',
      roleName: 'administrador',
      isActive: true,
    },
    {
      name: 'maximiliano',
      email: 'maximilianorestaurante@gmail.com',
      roleName: 'administrador',
      isActive: true,
    },
    {
      name: 'hector puerto final',
      email: 'proveedorespuertocapital@gmail.com',
      roleName: 'administrador',
      isActive: true,
    },
    { name: 'adsdd', email: 'hehe@gm.com', roleName: 'administrador', isActive: true },
    { name: 'sasa', email: 'ssq@d.com', roleName: 'administrador', isActive: true },
    { name: 'hector shinshu', email: 'hectorshu@g.com', roleName: 'administrador', isActive: true },

    // ---- rol_id = 1 (superadmin) ----
    {
      name: 'Hector Emilio',
      email: 'hectoremilio1000@gmail.com',
      roleName: 'superadmin',
      isActive: true,
    },

    // ---- rol_id = 3 (prospect) ----
    {
      name: 'hector velasquez',
      email: 'cantinallorona@gmail.com',
      roleName: 'prospect',
      isActive: true,
    },

    // ---- rol_id = 4 (employee) ----
    {
      name: 'hector emilio fake 1',
      email: 'hectoremilio2@gm.com',
      roleName: 'employee',
      isActive: true,
    },
    {
      name: 'pedrito 1 prueba',
      email: 'clickxp.com@gmail.com',
      roleName: 'employee',
      isActive: false,
    },
    { name: 'hector', email: 'juani@gmm.com', roleName: 'employee', isActive: false },
    {
      name: 'velvet mesero',
      email: 'velvetcoffeeshop@gmail.com',
      roleName: 'employee',
      isActive: true,
    },
    {
      name: 'emilio subgerente',
      email: 'growthsuitemx@gmail.com',
      roleName: 'employee',
      isActive: true,
    },
    {
      name: 'hector gerente',
      email: 'growthsuitemx+1@gmail.com',
      roleName: 'employee',
      isActive: true,
    },
  ]

  public async run() {
    // Contraseña común (hasheada una sola vez)
    const commonHash = await hash.make('01Hv1930#')

    for (const u of this.users) {
      // Trae el rol por nombre (o falla si no existe)
      const role = await Role.findByOrFail('name', u.roleName)

      // Crea o actualiza sin duplicar (idempotente)
      await User.updateOrCreate(
        { email: u.email }, // clave única
        {
          name: u.name,
          password: commonHash,
          rol_id: role.id,
          isActive: u.isActive,
        }
      )
    }
  }
}
