// app/controllers/ventas_dashboards_controller.ts
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

interface RangeParams {
  from?: string
  to?: string
  company_id?: number
  limit?: string
}

export default class VentasDashboardsController {
  /* helpers */
  private ok = (data: unknown) => ({ status: 'success', data })
  private fail = (r: HttpContext['response'], s: number, m: string) =>
    r.status(s).json({ status: 'error', message: m })

  /* ------------ Rango ------------ */
  private getRange({ from, to }: RangeParams) {
    console.log('[getRange] raw →', { from, to })

    const today = DateTime.now().startOf('day')
    const start = from ? DateTime.fromISO(from) : today
    const end = to ? DateTime.fromISO(to) : today.endOf('day')

    console.log('[getRange] parsed →', {
      startISO: start.toISO({ suppressMilliseconds: true }),
      endISO: end.toISO({ suppressMilliseconds: true }),
      isValid: { start: start.isValid, end: end.isValid },
    })

    if (!start.isValid || !end.isValid) throw new Error('BAD_DATES')
    return { start, end }
  }

  /* ------------ Query base ------------ */
  private buildQuery(ctx: HttpContext) {
    const { auth, request } = ctx
    const qs = request.qs() as RangeParams
    const { start, end } = this.getRange(qs)

    let companyId: number | undefined
    if (auth.user?.rol?.name !== 'super-admin') {
      companyId = (auth.user as any).company_id ?? auth.user?.companies?.[0]?.id ?? qs.company_id
      if (!companyId) throw new Error('NO_COMPANY')
    } else if (qs.company_id) {
      companyId = qs.company_id
    }

    /* Construye query */
    const q = db
      .from('ventas_softs')
      .whereBetween('apertura', [
        start.toSQL({ includeOffset: false }),
        end.toSQL({ includeOffset: false }),
      ])

    if (companyId) q.andWhere('company_id', companyId)

    // ------------- DEBUG -------------
    console.log('[buildQuery] params →', {
      companyId,
      start: start.toISO(),
      end: end.toISO(),
    })
    console.log('[buildQuery] SQL →', q.toQuery())
    // ----------------------------------

    return q
  }

  /* ------------ Endpoints ------------ */
  async overview(ctx: HttpContext) {
    try {
      const rows = await this.buildQuery(ctx)
        .select(
          db.raw('MIN(apertura)  AS apertura'),
          db.raw('MAX(cierre)    AS cierre'),
          db.raw('SUM(precio)    AS total_venta'),
          db.raw('SUM(descuento) AS total_descuento'),
          db.raw('SUM(cantidad)  AS total_items')
        )
        .groupByRaw('DATE(apertura), DATE(cierre)')
        .orderBy('apertura', 'desc')

      console.log('[overview] rows →', rows.length)
      return this.ok(rows)
    } catch (err) {
      if ((err as Error).message === 'NO_COMPANY')
        return this.fail(ctx.response, 403, 'Usuario sin empresa asignada')
      console.error('[overview] ERROR →', err)
      return this.fail(ctx.response, 500, 'Error interno al obtener totales')
    }
  }

  async products(ctx: HttpContext) {
    try {
      const { limit = '10' } = ctx.request.qs() as RangeParams
      const rows = await this.buildQuery(ctx)
        .select(
          'name_producto',
          db.raw('SUM(cantidad)        AS qty'),
          db.raw('SUM(cantidad*precio) AS importe')
        )
        .groupBy('name_producto')
        .orderBy('importe', 'desc')
        .limit(Number(limit))

      console.log('[products] rows →', rows.length)
      return this.ok(rows)
    } catch (err) {
      if ((err as Error).message === 'NO_COMPANY')
        return this.fail(ctx.response, 403, 'Usuario sin empresa asignada')
      console.error('[products] ERROR →', err)
      return this.fail(ctx.response, 500, 'Error interno al obtener productos')
    }
  }

  async waiters(ctx: HttpContext) {
    try {
      const rows = await this.buildQuery(ctx)
        .select(
          'name_mesero',
          db.raw('SUM(cantidad*precio)     AS importe'),
          db.raw('COUNT(DISTINCT apertura) AS turnos')
        )
        .groupBy('name_mesero')
        .orderBy('importe', 'desc')

      console.log('[waiters] rows →', rows.length)
      return this.ok(rows)
    } catch (err) {
      if ((err as Error).message === 'NO_COMPANY')
        return this.fail(ctx.response, 403, 'Usuario sin empresa asignada')
      console.error('[waiters] ERROR →', err)
      return this.fail(ctx.response, 500, 'Error interno al obtener meseros')
    }
  }

  async paymentMix(ctx: HttpContext) {
    try {
      const row = await this.buildQuery(ctx)
        .select(
          db.raw('SUM(efectivo) AS efectivo'),
          db.raw('SUM(vales)    AS vales'),
          db.raw('SUM(tarjeta)  AS tarjeta'),
          db.raw('SUM(credito)  AS credito')
        )
        .first()

      console.log('[paymentMix] row →', row)

      if (!row) return this.ok({ total: 0, mix: {} })

      const total = ['efectivo', 'vales', 'tarjeta', 'credito'].reduce(
        (s, k) => s + Number(row[k]),
        0
      )

      const mix = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, total ? Number(v) / total : 0])
      )

      return this.ok({ total, mix })
    } catch (err) {
      if ((err as Error).message === 'NO_COMPANY')
        return this.fail(ctx.response, 403, 'Usuario sin empresa asignada')
      console.error('[paymentMix] ERROR →', err)
      return this.fail(ctx.response, 500, 'Error interno al obtener mix de pago')
    }
  }
}
