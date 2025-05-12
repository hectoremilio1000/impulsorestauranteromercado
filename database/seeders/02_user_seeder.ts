/****************************************************************************************
 * database/seeders/UserSeeder.ts
 ****************************************************************************************/
import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import User from '#models/user'

type Row = {
  id: number
  name: string
  email: string
  rolId: number
  plainPassword: string
  emailVerifiedAt?: string // ISO string
  createdBy?: number
  whatsapp?: string
  isActive: boolean
}

export default class UserSeeder extends BaseSeeder {
  private rows: Row[] = [
    // --- rol 1 -----------------------------------------------------------------
    {
      id: 3,
      name: 'Hector Emilio',
      email: 'hectoremilio1000@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-01-30T09:58:05',
      rolId: 1,
      isActive: true,
    },

    // --- rol 2 -----------------------------------------------------------------
    {
      id: 1,
      name: 'Fake user',
      email: 'impulsorestaurantero@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-03-13T17:54:13',
      rolId: 2,
      isActive: true,
    },
    {
      id: 5,
      name: 'Hector',
      email: 'hectoremilio2@hotmail.com',
      plainPassword: '01Hv1930#',
      emailVerifiedAt: '2024-12-18T19:49:52',
      rolId: 2,
      isActive: true,
    },
    {
      id: 8,
      name: 'maximiliano',
      email: 'maximilianorestaurante@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-03-11T17:33:38',
      rolId: 2,
      whatsapp: '5521293811',
      isActive: true,
    },
    {
      id: 14,
      name: 'hector puerto final',
      email: 'proveedorespuertocapital@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-02-03T06:41:31',
      rolId: 2,
      whatsapp: '5521293811',
      isActive: true,
    },
    {
      id: 15,
      name: 'adsdd',
      email: 'hehe@gm.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-02-19T20:48:42',
      rolId: 2,
      whatsapp: '2331',
      isActive: true,
    },
    {
      id: 30,
      name: 'sasa',
      email: 'ssq@d.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-03-24T20:26:17',
      rolId: 2,
      whatsapp: '2332',
      isActive: true,
    },
    {
      id: 33,
      name: 'hector shinshu',
      email: 'hectorshu@g.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-03-26T05:02:52',
      rolId: 2,
      whatsapp: '535332',
      isActive: true,
    },

    // --- rol 3 -----------------------------------------------------------------
    {
      id: 6,
      name: 'hector velasquez',
      email: 'cantinallorona@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-01-30T10:07:33',
      rolId: 3,
      isActive: true,
    },

    // --- rol 4 -----------------------------------------------------------------
    {
      id: 24,
      name: 'hector emilio fake 1',
      email: 'hectoremilio2@gm.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-03-24T05:11:18',
      rolId: 4,
      isActive: true,
    },
    {
      id: 25,
      name: 'pedrito 1 prueba',
      email: 'clickxp.com@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-03-24T06:44:47',
      rolId: 4,
      createdBy: 3,
      whatsapp: '5521293811',
      isActive: false,
    },
    {
      id: 31,
      name: 'hector',
      email: 'juani@gmm.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-04-06T06:14:03',
      rolId: 4,
      createdBy: 3,
      whatsapp: '65532',
      isActive: false,
    },
    {
      id: 36,
      name: 'velvet mesero',
      email: 'velvetcoffeeshop@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-04-06T07:13:27',
      rolId: 4,
      createdBy: 3,
      whatsapp: '5521293811',
      isActive: true,
    },
    {
      id: 38,
      name: 'emilio subgerente',
      email: 'growthsuitemx@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-04-15T04:55:17',
      rolId: 4,
      createdBy: 3,
      whatsapp: '5521293811',
      isActive: true,
    },
    {
      id: 39,
      name: 'hector gerente',
      email: 'growthsuitemx+1@gmail.com',
      plainPassword: '01Hv193084',
      emailVerifiedAt: '2025-04-15T05:09:28',
      rolId: 4,
      createdBy: 3,
      whatsapp: '5521293811',
      isActive: true,
    },
  ]

  public async run() {
    for (const r of this.rows) {
      await User.updateOrCreate(
        { id: r.id },
        {
          name: r.name,
          email: r.email,
          password: await Hash.make(r.plainPassword),
          emailVerifiedAt: r.emailVerifiedAt ? DateTime.fromISO(r.emailVerifiedAt) : null,
          rol_id: r.rolId,
          ...(r.createdBy !== undefined ? { created_by: r.createdBy } : {}),
          ...(r.whatsapp ? { whatsapp: r.whatsapp } : {}),
          isActive: r.isActive,
        }
      )
    }
  }
}
