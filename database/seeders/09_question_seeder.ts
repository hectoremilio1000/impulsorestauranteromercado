import { DateTime } from 'luxon'

import Question from '#models/question'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class QuestionSeeder extends BaseSeeder {
  /**
   *  Si solo quieres que corra en local y no en producción
   *  descomenta la siguiente línea:
   */
  // public static developmentOnly = true

  public async run() {
    /**
     * Usamos updateOrCreateMany para que el seeder
     * pueda ejecutarse varias veces sin duplicar datos.
     */
    await Question.updateOrCreateMany('id', [
      {
        id: 1,
        statement: '¿Ya abriste tu negocio o estás en planeación?',
        context: 'general',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
        // Deja que updatedAt se llene automáticamente
      },
      {
        id: 2,
        statement: '¿Qué tipo de establecimiento tienes?',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 3,
        statement: '¿Cuánto es lo que te queda de lo que vendes después de gastos?',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 4,
        statement: '¿Cuál es el tipo de público que frecuenta más este tipo de negocio?',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 5,
        statement: '¿Ticket promedio actual o el que buscas?',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 6,
        statement: '¿Qué sabes del sector gastronómico?',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 7,
        statement: 'Tamaño de la inversión realizada o por realizar',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 8,
        statement: '¿Cuál es tu experiencia previa en la industria de restaurantes?',
        context: 'operando',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 9,
        statement: '¿Qué tipo de negocio planeas abrir?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 10,
        statement: '¿Quién será tu público objetivo principal? escoge 2',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 11,
        statement: '¿Cuál es el tamaño de la inversión inicial que planeas hacer?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 12,
        statement: '¿Qué tan claro tienes el concepto de tu negocio?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 13,
        statement: '¿Cuál será el ticket promedio por cliente?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 14,
        statement:
          '¿Qué nivel de experiencia tienes en la industria de restaurantes o negocios en general?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 15,
        statement: '¿Qué aspectos te preocupan más para iniciar tu negocio?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
      {
        id: 16,
        statement:
          '¿Qué tan importante será para tu negocio ofrecer un producto único y diferenciado?',
        context: 'planeacion',
        createdAt: DateTime.fromISO('2025-01-28T04:01:53'),
      },
    ])
  }
}
