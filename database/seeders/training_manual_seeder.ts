// database/seeders/TrainingManualSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TrainingManual from '#models/training_manual'

export default class TrainingManualSeeder extends BaseSeeder {
  public static developmentOnly = false

  private manuals = [
    {
      title: 'Manual de Ventas para Meseros',
      content: `# Manual de Ventas para Meseros
## Cantina La Llorona · CDMX
> *Versión 1.0 – Abril 2025*

### Objetivo
Dar a cada mesero una guía práctica, flexible y 100 % cantinera para:
1. Crear una **primera impresión memorable**.
2. **Guiar** la experiencia del comensal con técnica de ventas profesional.
3. **Incrementar ticket promedio** mediante upselling, cross-selling y neuroventas.

---

## 1. Estilos de Servicio Clave
(… pega aquí TODO el texto limpio …)
`,
      positionId: 1,
      companyId: 8,
    },
    {
      title: 'Manual de Hospitalidad - Cantina La Llorona · CDMX',
      content: `# Manual de Hospitalidad
## Cantina La Llorona · CDMX
> *Versión 1.0 – Abril 2025*

### Filosofía
“**Trata a cada quien como lo que es**” – Will Guidara.

---

## 1. Arquetipos & Gestos Clave
(… texto completo limpio …)
`,
      positionId: 1,
      companyId: 8,
    },
    { title: 'prueba 3', content: 'asdasda', positionId: 2, companyId: 10 },
    { title: 'manual de ventas', content: 'venta upselling', positionId: 1, companyId: 9 },
    {
      title: 'Manual de subgerente',
      content: 'manual de subgerente de ventas',
      positionId: 3,
      companyId: 8,
    },
  ]

  public async run() {
    for (const m of this.manuals) {
      await TrainingManual.updateOrCreate(
        { title: m.title, companyId: m.companyId, positionId: m.positionId },
        { content: m.content }
      )
    }
  }
}
