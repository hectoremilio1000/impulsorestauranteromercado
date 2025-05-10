import { DateTime } from 'luxon'

import Option from '#models/option' // Ajusta el alias si usas rutas relativas
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class OptionSeeder extends BaseSeeder {
  // public static developmentOnly = true

  public async run() {
    const ts = DateTime.fromISO('2025-01-27T22:02:04') // mismo timestamp para todas

    await Option.updateOrCreateMany('id', [
      /* ---------- P-001 ---------- */
      { id: 1, question_id: 1, text: 'Planeación', createdAt: ts },
      { id: 2, question_id: 1, text: 'Operación', createdAt: ts },

      /* ---------- P-002 ---------- */
      { id: 3, question_id: 2, text: 'Cafetería', createdAt: ts },
      { id: 4, question_id: 2, text: 'Bar', createdAt: ts },
      { id: 5, question_id: 2, text: 'Restaurante', createdAt: ts },
      { id: 6, question_id: 2, text: 'Cantina', createdAt: ts },
      { id: 7, question_id: 2, text: 'Food Truck', createdAt: ts },
      { id: 8, question_id: 2, text: 'Establecimiento de Coctelería de Autor', createdAt: ts },
      { id: 9, question_id: 2, text: 'Panadería', createdAt: ts },

      /* ---------- P-003 ---------- */
      { id: 10, question_id: 3, text: '5 a 10%', createdAt: ts },
      { id: 11, question_id: 3, text: 'Nada', createdAt: ts },
      { id: 12, question_id: 3, text: '10% a 20%', createdAt: ts },
      { id: 13, question_id: 3, text: 'Más del 20%', createdAt: ts },

      /* ---------- P-004 ---------- */
      { id: 14, question_id: 4, text: 'Oficinistas', createdAt: ts },
      { id: 15, question_id: 4, text: 'Familias', createdAt: ts },
      { id: 16, question_id: 4, text: 'Extranjeros', createdAt: ts },
      { id: 17, question_id: 4, text: 'Jóvenes', createdAt: ts },
      { id: 18, question_id: 4, text: 'Turistas', createdAt: ts },
      { id: 19, question_id: 4, text: 'Adultos mayores', createdAt: ts },

      /* ---------- P-005 ---------- */
      { id: 20, question_id: 5, text: '50 a 200 por persona', createdAt: ts },
      { id: 21, question_id: 5, text: '200 a 500 por persona', createdAt: ts },
      { id: 22, question_id: 5, text: '500 a 1500 por persona', createdAt: ts },
      { id: 23, question_id: 5, text: 'Más de 1500 por persona', createdAt: ts },
      { id: 24, question_id: 5, text: 'No sé', createdAt: ts },

      /* ---------- P-006 ---------- */
      { id: 25, question_id: 6, text: 'Amplio conocimiento de cocina', createdAt: ts },
      { id: 26, question_id: 6, text: 'Amplio conocimiento de barra', createdAt: ts },
      { id: 27, question_id: 6, text: 'Amplio conocimiento de servicio', createdAt: ts },
      {
        id: 28,
        question_id: 6,
        text: 'Amplio conocimiento de cocina, barra y servicio',
        createdAt: ts,
      },
      { id: 29, question_id: 6, text: 'Poca experiencia', createdAt: ts },

      /* ---------- P-007 ---------- */
      { id: 30, question_id: 7, text: '$100,000 a $500,000', createdAt: ts },
      { id: 31, question_id: 7, text: '$500,000 a $2,000,000', createdAt: ts },
      { id: 32, question_id: 7, text: '$2,000,000 a $8,000,000', createdAt: ts },
      { id: 33, question_id: 7, text: 'Más de $8,000,000', createdAt: ts },

      /* ---------- P-008 ---------- */
      { id: 34, question_id: 8, text: 'Ninguna experiencia', createdAt: ts },
      { id: 35, question_id: 8, text: 'Experiencia moderada', createdAt: ts },
      { id: 36, question_id: 8, text: 'Amplia experiencia', createdAt: ts },

      /* ---------- P-009 ---------- */
      { id: 37, question_id: 9, text: 'Cafetería', createdAt: ts },
      { id: 38, question_id: 9, text: 'Bar', createdAt: ts },
      { id: 39, question_id: 9, text: 'Restaurante', createdAt: ts },
      { id: 40, question_id: 9, text: 'Cantina', createdAt: ts },
      { id: 41, question_id: 9, text: 'Food Truck', createdAt: ts },
      { id: 42, question_id: 9, text: 'Establecimiento de Coctelería de Autor', createdAt: ts },
      { id: 43, question_id: 9, text: 'Panadería', createdAt: ts },

      /* ---------- P-010 ---------- */
      { id: 44, question_id: 10, text: 'Oficinistas', createdAt: ts },
      { id: 45, question_id: 10, text: 'Familias', createdAt: ts },
      { id: 46, question_id: 10, text: 'Jóvenes', createdAt: ts },
      { id: 47, question_id: 10, text: 'Extranjeros', createdAt: ts },
      { id: 48, question_id: 10, text: 'Turistas', createdAt: ts },
      { id: 49, question_id: 10, text: 'Adultos mayores', createdAt: ts },

      /* ---------- P-011 ---------- */
      { id: 50, question_id: 11, text: '$100,000 a $500,000', createdAt: ts },
      { id: 51, question_id: 11, text: '$500,000 a $2,000,000', createdAt: ts },
      { id: 52, question_id: 11, text: '$2,000,000 a $8,000,000', createdAt: ts },
      { id: 53, question_id: 11, text: 'Más de $8,000,000', createdAt: ts },

      /* ---------- P-012 ---------- */
      { id: 54, question_id: 12, text: 'Muy claro, tengo una idea definida.', createdAt: ts },
      {
        id: 55,
        question_id: 12,
        text: 'Medianamente claro, necesito ayuda para refinarlo.',
        createdAt: ts,
      },
      {
        id: 56,
        question_id: 12,
        text: 'No tengo claro el concepto, necesito orientación.',
        createdAt: ts,
      },

      /* ---------- P-013 ---------- */
      { id: 57, question_id: 13, text: 'Menos de $200', createdAt: ts },
      { id: 58, question_id: 13, text: '$200 a $500', createdAt: ts },
      { id: 59, question_id: 13, text: '$500 a $1,500', createdAt: ts },
      { id: 60, question_id: 13, text: 'Más de $1,500', createdAt: ts },

      /* ---------- P-014 ---------- */
      { id: 61, question_id: 14, text: 'Ninguna experiencia', createdAt: ts },
      { id: 62, question_id: 14, text: 'Experiencia moderada', createdAt: ts },
      { id: 63, question_id: 14, text: 'Amplia experiencia', createdAt: ts },

      /* ---------- P-015 ---------- */
      { id: 64, question_id: 15, text: 'Definir el concepto', createdAt: ts },
      { id: 65, question_id: 15, text: 'Crear un plan de negocio', createdAt: ts },
      { id: 66, question_id: 15, text: 'Elegir la ubicación correcta', createdAt: ts },
      { id: 67, question_id: 15, text: 'Crear una estrategia de marketing', createdAt: ts },
      { id: 68, question_id: 15, text: 'Manejar los costos y presupuestos', createdAt: ts },
      { id: 69, question_id: 15, text: 'Conseguir los permisos necesarios', createdAt: ts },
      { id: 70, question_id: 15, text: 'Capacitar al personal', createdAt: ts },

      /* ---------- P-016 ---------- */
      {
        id: 71,
        question_id: 16,
        text: 'Muy importante, quiero destacar con algo único.',
        createdAt: ts,
      },
      {
        id: 72,
        question_id: 16,
        text: 'Medianamente importante, quiero algo competitivo pero sencillo.',
        createdAt: ts,
      },
      {
        id: 73,
        question_id: 16,
        text: 'No es mi prioridad, quiero algo funcional.',
        createdAt: ts,
      },
    ])
  }
}
