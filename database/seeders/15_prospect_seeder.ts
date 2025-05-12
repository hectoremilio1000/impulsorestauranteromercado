import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Prospect from '#models/prospect'

export default class ProspectSeeder extends BaseSeeder {
  public async run() {
    await Prospect.updateOrCreateMany('id', [
      /* ───────── ID 1 ───────── */
      {
        id: 1,
        first_name: 'prospecto prueba 1',
        last_name: 'asdas',
        email: 'sss@gmail.com',
        whatsapp: '5234234',
        createdAt: DateTime.fromSQL('2025-05-09 18:12:22'),
      },

      /* ───────── ID 2 ───────── */
      {
        id: 2,
        first_name: 'prospecto 2',
        last_name: 'velasquez',
        email: 'hector@gmail.com',
        whatsapp: '5521293811',
        status: 'creado',
        origin: 'panelIA',
        createdAt: DateTime.fromSQL('2025-05-09 21:50:05'),
      },

      /* ───────── ID 3 ───────── */
      {
        id: 3,
        first_name: 'hector',
        last_name: 'velasquez',
        email: 'hectoremilio1000@gmail.com',
        whatsapp: '5521293811',
        status: 'creado',
        origin: 'pdfBanner',
        createdAt: DateTime.fromSQL('2025-05-11 19:20:42'),
      },

      /* ───────── ID 4 ───────── */
      {
        id: 4,
        first_name: 'Paulina',
        last_name: 'Castillejos Bautista',
        email: 'casti_bau@hotmail.com',
        whatsapp: '9511785266',
        status: 'creado',
        origin: 'pdfBanner',
        createdAt: DateTime.fromSQL('2025-02-23 07:32:24'),
      },

      /* ───────── ID 5 ───────── */
      {
        id: 5,
        first_name: 'prueba 3',
        last_name: 'velasquez',
        email: 'hectoremilio1000@gmail.com',
        whatsapp: '5521293811',
        status: 'creado',
        origin: 'pdfBanner',
        createdAt: DateTime.fromSQL('2025-05-12 02:58:35'),
      },

      /* ───────── ID 6 ───────── */
      {
        id: 6,
        first_name: 'prueba 4',
        last_name: 'velasquez',
        email: 'hectoremilio1000@gmail.com',
        whatsapp: '5521293811',
        status: 'creado',
        origin: 'citaenvivo',
        createdAt: DateTime.fromSQL('2025-05-12 02:59:38'),
      },
    ])
  }
}
