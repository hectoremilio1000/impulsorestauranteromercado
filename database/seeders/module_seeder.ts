import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Module from '#models/module' // Ajusta la ruta según tu estructura de carpetas

export default class ModuleSeeder extends BaseSeeder {
  public async run() {
    await Module.createMany([
      {
        id: 1,
        name: 'Marketing',
        description:
          'Con técnicas avanzadas de SEO y estrategias de marketing digital, impulsamos tu visibilidad...',
        active: true, // 1 => true
        created_by: 3,
      },
      {
        id: 2,
        name: 'Sitio Web',
        description: 'Diseñamos tu web y sistema de reservas para llenar tu restaurante...',
        active: true,
        created_by: 3,
      },
      {
        id: 3,
        name: 'Punto de Venta',
        description: 'Te damos un punto de venta para que puedas agilizar el cobro a tus clientes.',
        active: true,
        created_by: 3,
      },
      {
        id: 4,
        name: 'RRHH',
        description:
          'Te ofrecemos manuales y un departamento de recursos humanos en línea para tus empleados.',
        active: true,
        created_by: 3,
      },
      {
        id: 5,
        name: 'Fidelización',
        description:
          'Creamos programas de lealtad innovadores utilizando sistemas de recompensas y puntos.',
        active: true,
        created_by: 3,
      },
      {
        id: 6,
        name: 'Asesoría',
        description: 'Te ayudamos a mantener todos los permisos y requisitos legales al día.',
        active: true,
        created_by: 3,
      },
      {
        id: 7,
        name: 'Financiamiento',
        description: 'Financiamiento para compra de equipo y crecimiento de tu restaurante.',
        active: true,
        created_by: 3,
      },
      {
        id: 8,
        name: 'Encuestas de servicio',
        description: 'Encuestas de servicio en tiempo Real.',
        active: true,
        created_by: 3,
      },
      {
        id: 9,
        name: 'Inventario',
        description: 'Control preciso y procesos optimizados para reducir costos de tu inventario.',
        active: true,
        created_by: 3,
      },
      {
        id: 10,
        name: 'Monitoreo',
        description: 'Medimos la productividad de las personas con monitoreo en tu negocio.',
        active: true,
        created_by: 3,
      },
      {
        id: 11,
        name: 'Ayuda IA',
        description:
          'Ayuda para la definición de qué hacer, concepto, visión y misión de tu restaurante.',
        active: true,
        created_by: 3,
      },
    ])
  }
}
