// database/seeders/PermisoLegalSeeder.ts

import PermisoLegal from '#models/permisos_legale'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class PermisoLegalSeeder extends BaseSeeder {
  public async run() {
    await PermisoLegal.createMany([
      {
        // id se autoincrementa, no lo pongas si la columna es AI
        name: 'licencia de funcionamiento',
        description: 'aas',
        institucion: 'dsada',
        tramiteLink: 'sdasdads',
        costo: '2122',
      },
      {
        name: 'Aviso de Funcionamiento (Giro de Bajo Impacto)',
        description:
          'Aviso que permite operar un establecimiento mercantil de bajo impacto en la CDMX',
        institucion: 'Secretaría de Desarrollo Económico (SEDECO)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: 'Sin costo',
      },
      {
        name: 'Aviso de Funcionamiento (Giro de Impacto Vecinal)',
        description:
          'Aviso de funcionamiento necesario para operar un establecimiento de impacto vecinal',
        institucion: 'Secretaría de Desarrollo Económico (SEDECO)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: 'Variable, ~$13,118 MXN (según superficie)',
      },
      {
        name: 'Permiso de Operación (Giro de Impacto Zonal)',
        description: 'Permiso requerido para operar establecimientos mercantiles de impacto zonal',
        institucion: 'Secretaría de Desarrollo Económico (SEDECO)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: 'Variable, ~$26,237 MXN (según superficie)',
      },
      {
        name: 'Certificado Único de Zonificación de Uso de Suelo',
        description:
          'Documento oficial que indica la zonificación y los usos de suelo permitidos en un predio',
        institucion:
          'Secretaría de Planeación, Ordenamiento Territorial y Gestión del Suelo (SEDUVI)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: '$2,025.00 MXN',
      },
      {
        name: 'Visto Bueno de Seguridad y Operación',
        description:
          'Autorización en materia de protección civil que certifica condiciones de seguridad',
        institucion: 'Alcaldías (Unidad de Protección Civil)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: 'Sin costo',
      },
      {
        name: 'Constancia de No Adeudo de Impuesto Predial',
        description:
          'Certificado emitido por la Tesorería CDMX que acredita que no existen adeudos de predial',
        institucion: 'Secretaría de Administración y Finanzas (Tesorería CDMX)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: '$219.00 MXN',
      },
      {
        name: 'Constancia de No Adeudo de Agua',
        description: 'Certificación de que no existen adeudos por el suministro de agua',
        institucion: 'Secretaría de Gestión Integral del Agua (Sistema de Aguas de la CDMX)',
        tramiteLink: 'https://www.cdmx.gob.mx/public/InformacionTramite....',
        costo: '$219.00 MXN',
      },
      // 👉 Agrega aquí los 242 registros restantes
    ])
  }
}
