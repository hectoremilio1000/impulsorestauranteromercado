// database/seeders/training_manuals_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import TrainingManual from '#models/training_manual' // cambia si usas otro alias/ruta

export default class TrainingManualSeeder extends BaseSeeder {
  public async run() {
    await TrainingManual.updateOrCreateMany('id', [
      {
        id: 1,
        title: 'Manual de Ventas para Meseros Cantina La Llorona',
        content: `Manual de Ventas para Meseros – Cantina La Llorona...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-07 00:48:58'),
        updatedAt: DateTime.fromSQL('2025-04-21 19:35:06'),
      },
      {
        id: 2,
        title: 'Manual de Hospitalidad - Cantina La Llorona · CDMX...',
        content: `Filosofía

“Trata a cada quien como lo que es” – W...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-07 02:58:13'),
        updatedAt: DateTime.fromSQL('2025-04-22 18:30:54'),
      },
      {
        id: 3,
        title: 'prueba 3',
        content: 'asdasda',
        positionId: 2,
        companyId: 10,
        createdAt: DateTime.fromSQL('2025-04-07 03:01:29'),
        updatedAt: DateTime.fromSQL('2025-04-07 03:01:29'),
      },
      {
        id: 4,
        title: 'manual de ventas',
        content: 'venta upselling',
        positionId: 1,
        companyId: 9,
        createdAt: DateTime.fromSQL('2025-04-07 04:04:43'),
        updatedAt: DateTime.fromSQL('2025-04-07 04:04:43'),
      },
      {
        id: 5,
        title: 'Manual de subgerente',
        content: 'manual de subgerente de ventas',
        positionId: 3,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-15 04:43:30'),
        updatedAt: DateTime.fromSQL('2025-04-15 04:43:30'),
      },
      {
        id: 6,
        title: 'manual limpiar mesa',
        content: 'limpia bonito la mesa',
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-19 18:16:19'),
        updatedAt: DateTime.fromSQL('2025-04-19 18:16:19'),
      },
      {
        id: 7,
        title: 'limiar mesa',
        content: 'sfdasdd',
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-19 18:16:56'),
        updatedAt: DateTime.fromSQL('2025-04-19 18:16:56'),
      },
      {
        id: 8,
        title: 'Manual de Uso de POS & Comandas',
        content: `Manual de Uso – POS & Comandas

ID: 8
Hardware & R...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-19 18:17:50'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:39:17'),
      },
      {
        id: 9,
        title: 'Manual de Estilo de Servicio & Secuencia de Pasos ...',
        content: `Objetivo
---- meter llevar servilletas
Estandariza...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-19 20:06:47'),
        updatedAt: DateTime.fromSQL('2025-04-21 22:11:07'),
      },
      {
        id: 10,
        title: 'Manual de Resolución de Quejas - Cantina La Lloron...',
        content: `Manual de Limpieza y Murteo de Mesas

Cantina La L...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-20 05:30:56'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:20:16'),
      },
      {
        id: 11,
        title: 'Manual de Tareas Operativas para Meseros - Cantina...',
        content: `Manual de Tareas Operativas para Meseros
Cantina L...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-21 03:44:11'),
        updatedAt: DateTime.fromSQL('2025-04-21 03:44:11'),
      },
      {
        id: 12,
        title: 'Exámen ventas mesero',
        content: `Examen - Manual de Ventas para Meseros
Instruccion...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-21 18:38:28'),
        updatedAt: DateTime.fromSQL('2025-04-21 18:38:28'),
      },
      {
        id: 13,
        title: 'Examen hospitalidad',
        content: `Examen - Manual de Hospitalidad para Meseros
Instr...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:21:24'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:21:24'),
      },
      {
        id: 14,
        title: 'Respuestas examen hospitalidad',
        content: `Clave de respuestas
1 c | 2 c | 3 c | 4 c | 5 c | ...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:21:39'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:21:39'),
      },
      {
        id: 15,
        title: 'Examen - Manual de Estilo de Servicio & Secuencia ...',
        content: `Examen - Manual de Estilo de Servicio & Secuencia ...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:23:20'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:23:20'),
      },
      {
        id: 16,
        title: 'Respuestas - Manual de Estilo de Servicio & Secuen...',
        content: `1 c | 2 b | 3 c | 4 b | 5 c | 6 b | 7 c | 8 c | 9 ...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:23:49'),
        updatedAt: DateTime.fromSQL('2025-04-22 22:29:49'),
      },
      {
        id: 17,
        title: 'Examen - Manual de Resolución de Quejas (Meseros) ...',
        content: `Tiempo máximo para responder al primer signo de mo...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:29:59'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:36:12'),
      },
      {
        id: 18,
        title: 'Manual de Lavado de Cristalería – Barra - Cantina ...',
        content: `Manual de Lavado de Cristalería – Barra

Cantina L...`,
        positionId: 4,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:43:14'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:43:14'),
      },
      {
        id: 19,
        title: 'respuestas - Resolución de Quejas (Meseros)',
        content: `Clave de respuestas
1 c | 2 c | 3 c | 4 c | 5 b | ...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 20:45:00'),
        updatedAt: DateTime.fromSQL('2025-04-22 20:45:00'),
      },
      {
        id: 20,
        title: 'Escala de calificaciones',
        content: `Escala de calificación (0 – 15 aciertos → 1 – 10)...`,
        positionId: 1,
        companyId: 8,
        createdAt: DateTime.fromSQL('2025-04-22 22:29:03'),
        updatedAt: DateTime.fromSQL('2025-04-22 22:29:03'),
      },
    ])
  }
}
