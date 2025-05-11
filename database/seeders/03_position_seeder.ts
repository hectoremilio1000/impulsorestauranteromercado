// database/seeders/position_seeder.ts
import Position from '#models/position'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  public async run() {
    await Position.updateOrCreateMany('nombre', [
      { nombre: 'Mesero', tipo: 'piso', version: 1, activo: true },
      { nombre: 'Gerente', tipo: 'piso', version: 1, activo: true },
      { nombre: 'Subgerente', tipo: 'piso', version: 1, activo: true },
      { nombre: 'Barman', tipo: 'barra', version: 1, activo: true },
      { nombre: 'Backbar', tipo: 'barra', version: 1, activo: true },
      { nombre: 'Jefe de Barra', tipo: 'barra', version: 1, activo: true },
      { nombre: 'Cocinero', tipo: 'cocina', version: 1, activo: true },
      { nombre: 'Lavaloza', tipo: 'cocina', version: 1, activo: true },
      { nombre: 'Ayudante de Cocina', tipo: 'cocina', version: 1, activo: true },
      { nombre: 'Subjefe de Cocina', tipo: 'cocina', version: 1, activo: true },
      { nombre: 'Jefe de Cocina', tipo: 'cocina', version: 1, activo: true },
      { nombre: 'Capitán', tipo: 'piso', version: 1, activo: true },
      { nombre: 'Garrotero', tipo: 'piso', version: 1, activo: true },

      // — Nuevos registros —
      { nombre: 'Auxiliar administrativo', tipo: 'administración', version: 1, activo: true },
      { nombre: 'Community Manager', tipo: 'marketing', version: 1, activo: true },
      {
        nombre: 'Analista de marketing digital / Growth Hacker',
        tipo: 'marketing',
        version: 1,
        activo: true,
      },
      {
        nombre: 'Ejecutivo(a) de eventos y banquetes',
        tipo: 'marketing',
        version: 1,
        activo: true,
      },
      { nombre: 'Gerente de marketing y ventas', tipo: 'marketing', version: 1, activo: true },
      { nombre: 'Reclutador(a) / Talent Acquisition', tipo: 'rrhh', version: 1, activo: true },
      { nombre: 'Analista de clima laboral / Engagement', tipo: 'rrhh', version: 1, activo: true },
      { nombre: 'Jefe(a) de Recursos Humanos', tipo: 'rrhh', version: 1, activo: true },
      { nombre: 'Head of People / Director(a) de Talento', tipo: 'rrhh', version: 1, activo: true },
      {
        nombre: 'Gerente administrativo-financiero',
        tipo: 'administración',
        version: 1,
        activo: true,
      },
    ])
  }
}
