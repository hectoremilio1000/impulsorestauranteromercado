// database/seeders/CompanySeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'

export default class CompanySeeder extends BaseSeeder {
  public static developmentOnly = false

  private companies = [
    {
      name: 'La llorona Cantina',
      email: 'lalloronacantina@gmail.com',
      logo: null,
      website: 'https://lalloronacantina.com',
      phoneContact: '529876787656',
      userId: 5,
      createdBy: 3,
    },
    {
      name: 'Mi Restaurante Prueba',
      email: 'contacto@mirestaurante.com',
      logo: 'URL-del-logo.jpg',
      website: 'https://mirestaurante.com',
      phoneContact: '555-555-5555',
      userId: 8,
      createdBy: null,
    },
    {
      name: 'puerto capital',
      email: null,
      logo: null,
      website: 'https://puertocapital.com',
      phoneContact: null,
      userId: 14,
      createdBy: 3,
    },
    {
      name: 'juaito empress',
      email: null,
      logo: null,
      website: null,
      phoneContact: null,
      userId: 15,
      createdBy: 3,
    },
    {
      name: 'fake empresa',
      email: null,
      logo: null,
      website: null,
      phoneContact: null,
      userId: 1,
      createdBy: 3,
    },
    {
      name: 'fake empresa 2',
      email: null,
      logo: null,
      website: null,
      phoneContact: null,
      userId: 1,
      createdBy: 3,
    },
    {
      name: 'fake empresa 3',
      email: null,
      logo: null,
      website: null,
      phoneContact: null,
      userId: 1,
      createdBy: 3,
    },
    {
      name: 'mi restaurante',
      email: 'eeeq@g.com',
      logo: null,
      website: 'https://ajsjdajsd',
      phoneContact: '423423',
      userId: 3,
      createdBy: 3,
    },
    {
      name: 'mi emopresita',
      email: 'hect@gmil.com',
      logo: 'https://www.lalloronacantina.com/_next/static/media/logo.png',
      website: 'https://www.lalloronacantina.com/',
      phoneContact: '55212831',
      userId: 33,
      createdBy: 3,
    },
  ]

  public async run() {
    for (const c of this.companies) {
      await Company.updateOrCreate(
        { name: c.name, user_id: c.userId }, // clave “única”
        {
          email: c.email,
          logo: c.logo,
          website: c.website,
          phone_contact: c.phoneContact,
          created_by: c.createdBy,
        }
      )
    }
  }
}
