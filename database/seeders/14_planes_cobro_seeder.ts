// database/seeders/PlansSeeder.ts
import Plan from '#models/plan'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class PlansSeeder extends BaseSeeder {
  public async run() {
    await Plan.createMany([
      {
        // id se autoincrementa; omítelo si la columna es AI
        name: 'Plan Básico',
        description: 'Plan básico con IA y 2 horas gratis',
        price: 10000,
        active: true,
        created_by: 3, // ID del usuario que lo creó
        max_modules: 4,
        coachingIncluded: 2,
      },
      {
        name: 'Plan Pro',
        description: 'Plan completo con 4 horas coaching',
        price: 20000,
        active: true,
        created_by: 3,
        max_modules: 11,
        coachingIncluded: 4,
      },
      /* agrega aquí más planes si lo deseas */
    ])
  }
}
