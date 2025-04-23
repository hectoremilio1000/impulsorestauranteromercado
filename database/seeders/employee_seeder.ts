// database/seeders/EmployeeSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Employee from '#models/employee'

export default class EmployeeSeeder extends BaseSeeder {
  public static developmentOnly = false

  private employees = [
    {
      name: 'velvet mesero',
      email: 'velvetcoffeeshop@gmail.com',
      phone: '5521293811',
      companyId: 8,
      userId: 36,
      positionId: 1,
      createdBy: 3,
    },
    {
      name: 'emilio subgerente',
      email: 'growthsuitemx@gmail.com',
      phone: '5521293811',
      companyId: 8,
      userId: 38,
      positionId: 3,
      createdBy: 3,
    },
    {
      name: 'hector gerente',
      email: 'growthsuitemx+1@gmail.com',
      phone: '5521293811',
      companyId: 8,
      userId: 39,
      positionId: 2,
      createdBy: 3,
    },
  ]

  public async run() {
    for (const e of this.employees) {
      await Employee.updateOrCreate(
        { email: e.email, company_id: e.companyId }, // clave compuesta
        {
          name: e.name,
          phone: e.phone,
          userId: e.userId,
          positionId: e.positionId,
          createdBy: e.createdBy,
        }
      )
    }
  }
}
