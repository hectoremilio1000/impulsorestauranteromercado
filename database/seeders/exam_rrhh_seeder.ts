import Exam from '#models/exam' // alias definido en tu tsconfig
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class ExamSeeder extends BaseSeeder {
  public async run() {
    await Exam.updateOrCreateMany(
      'name',
      [
        { name: 'Mesero', type: 'Conocimientos', version: 1, active: true },
        { name: 'Gerente', type: 'Conocimientos', version: 1, active: true },
        { name: 'Subgerente', type: 'Conocimientos', version: 1, active: true },
        { name: 'Barman', type: 'Conocimientos', version: 1, active: true },
        { name: 'Backbar', type: 'Conocimientos', version: 1, active: true },
        { name: 'Jefe de Barra', type: 'Conocimientos', version: 1, active: true },
        { name: 'Cocinero', type: 'Conocimientos', version: 1, active: true },
        { name: 'Lavaloza', type: 'Conocimientos', version: 1, active: true },
        { name: 'Ayudante de Cocina', type: 'Conocimientos', version: 1, active: true },
        { name: 'Subjefe de Cocina', type: 'Conocimientos', version: 1, active: true },
        { name: 'Jefe de Cocina', type: 'Conocimientos', version: 1, active: true },
        { name: 'Capitán', type: 'Conocimientos', version: 1, active: true },
        { name: 'Garrotero', type: 'Conocimientos', version: 1, active: true },
        { name: 'Bondad', type: 'Psicométrico', version: 1, active: true },
        { name: 'Optimismo', type: 'Psicométrico', version: 1, active: true },
        { name: 'Etica', type: 'Psicométrico', version: 1, active: true },
        { name: 'Curiosidad', type: 'Psicométrico', version: 1, active: true },
        { name: 'Integridad', type: 'Psicométrico', version: 1, active: true },
        { name: 'Autoconciencia', type: 'Psicométrico', version: 1, active: true },
        { name: 'Empatia', type: 'Psicométrico', version: 1, active: true },
      ].map((exam) => ({
        ...exam,
        createdAt: DateTime.local(), // se llenan estos timestamps
        updatedAt: DateTime.local(),
      }))
    )
  }
}
