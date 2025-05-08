import VentaSoft from '#models/venta_soft'
import type { HttpContext } from '@adonisjs/core/http'

export default class VentasSoftsController {
  // Listar todos los ventas softs (GET /modules)
  public async index({}: HttpContext) {
    try {
      const ventas_softs = await VentaSoft.all()
      return {
        status: 'success',
        code: 200,
        message: 'ventas_softs fetched successfully',
        data: ventas_softs,
      }
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: 'Error fetching ventas softs',
        error: error.message,
      }
    }
  }

  // Mostrar una venta soft individual por ID (GET /modules/:id)
  public async show({ params }: HttpContext) {
    try {
      const venta_soft = await VentaSoft.findOrFail(params.id)
      return {
        status: 'success',
        code: 200,
        message: 'Venta Soft fetched successfully',
        data: venta_soft,
      }
    } catch (error) {
      return {
        status: 'error',
        code: 404,
        message: 'Module not found',
        error: error.message,
      }
    }
  }

  // Crear un nuevo module (POST /modules)
  public async store({ request }: HttpContext) {
    try {
      const data = request.only([
        'cantidad',
        'descuento',
        'name_producto',
        'precio',
        'impuesto1',
        'preciosinimpuestos',
        'preciocatalogo',
        'comentario',
        'idestacion',
        'idmeseroproducto',
        'name_mesero',
        'apertura',
        'cierre',
        'cajero',
        'efectivo',
        'vales',
        'tarjeta',
        'credito',
        'fondo',
      ]) // Asume que estos campos existen

      if (data) {
        const venta_soft = await VentaSoft.create(data)
        // Crear el nuevo module con el `created_by` del usuario autenticado

        return {
          status: 'success',
          code: 201,
          message: 'venta_soft created successfully',
          data: venta_soft,
        }
      }
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: 'Error creating module',
        error: error.message,
      }
    }
  }
  // Update ventas softs (POST /modules)
  public async update({ params, request }: HttpContext) {
    try {
      const venta_soft = await VentaSoft.findOrFail(params.id)
      const data = request.only([
        'cantidad',
        'descuento',
        'name_producto',
        'precio',
        'impuesto1',
        'preciosinimpuestos',
        'preciocatalogo',
        'comentario',
        'idestacion',
        'idmeseroproducto',
        'name_mesero',
        'apertura',
        'cierre',
        'cajero',
        'efectivo',
        'vales',
        'tarjeta',
        'credito',
        'fondo',
      ]) // Asume que estos campos existen
      venta_soft.merge(data)
      await venta_soft.save()

      return {
        status: 'success',
        code: 201,
        message: 'venta_soft updated successfully',
        data: venta_soft,
      }
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: 'Error update ',
        error: error.message,
      }
    }
  }
  // create ventas masivas softs (POST /modules)
  public async ventasSoftsMasive({ request }: HttpContext) {
    try {
      const data = request.only(['ventas_softs', 'company_id']) // Asume que estos campos existen
      if (data.ventas_softs && Array.isArray(data.ventas_softs)) {
        const newData = data.ventas_softs.map((v) => {
          return { ...v, company_id: data.company_id }
        })
        console.log(newData)
        await VentaSoft.createMany(newData)
        return {
          status: 'success',
          code: 201,
          message: 'venta_soft updated successfully',
        }
      }
    } catch (error) {
      return {
        status: 'error',
        code: 500,
        message: 'Error update ',
        error: error.message,
      }
    }
  }
}
