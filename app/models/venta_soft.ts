import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class VentaSoft extends BaseModel {
  public static table = 'ventas_softs'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare company_id: number

  @column()
  declare cantidad: number

  @column()
  declare descuento: number

  @column()
  declare name_producto: string

  @column()
  declare precio: number

  @column({ columnName: 'impuesto1' })
  declare impuesto1: number

  @column()
  declare preciosinimpuestos: number

  @column()
  declare preciocatalogo: number

  @column()
  declare comentario: string

  @column()
  declare idestacion: string

  @column()
  declare idmeseroproducto: string

  @column()
  declare apertura: string

  @column()
  declare cierre: string

  @column()
  declare cajero: string

  @column()
  declare efectivo: number

  @column()
  declare vales: number

  @column()
  declare tarjeta: number

  @column()
  declare credito: number

  @column()
  declare fondo: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
