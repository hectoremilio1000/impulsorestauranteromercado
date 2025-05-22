import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class VentaSoft extends BaseModel {
  public static table = 'ventas_softs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare company_id: number | null

  @column()
  declare folio: string | null

  @column()
  declare mesa: string | null

  @column()
  declare total_cuenta: number | null

  @column()
  declare idturno: string | null

  @column()
  declare totalarticulos: number | null

  @column()
  declare efectivo: number | null

  @column()
  declare tarjeta: number | null

  @column()
  declare vales: number | null

  @column()
  declare otros: number | null

  @column()
  declare propina: number | null

  @column()
  declare totalconpropina: number | null

  @column()
  declare idtipodescuento: number | null

  @column()
  declare descuento_cuenta: number | null

  @column()
  declare cancelado: number | null

  @column()
  declare cantidad: number | null

  @column()
  declare descuento: number | null

  @column()
  declare name_producto: string | null

  @column()
  declare clasificacion: string | null

  @column()
  declare precio: number | null

  @column({ columnName: 'impuesto1' })
  declare impuesto1: number | null

  @column()
  declare preciosinimpuestos: number | null

  @column()
  declare preciocatalogo: number | null

  @column()
  declare comentario: string | null

  @column()
  declare idestacion: string | null

  @column()
  declare idmeseroproducto: string | null

  @column()
  declare name_mesero: string | null

  @column()
  declare apertura: string | null

  @column()
  declare cierre: string | null

  @column()
  declare cajero: string | null

  @column()
  declare turno_efectivo: number | null

  @column()
  declare turno_vales: number | null

  @column()
  declare turno_tarjeta: number | null

  @column()
  declare credito: number | null

  @column()
  declare fondo: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
