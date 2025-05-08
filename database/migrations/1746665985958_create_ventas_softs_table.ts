import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ventas_softs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('company_id').nullable()
      table.integer('cantidad').nullable()
      table.decimal('descuento').nullable()
      table.string('name_producto').nullable()
      table.decimal('precio').nullable()
      table.decimal('impuesto1').nullable()
      table.decimal('preciosinimpuestos').nullable()
      table.decimal('preciocatalogo').nullable()
      table.string('comentario').nullable()
      table.string('idestacion').nullable()
      table.string('idmeseroproducto').nullable()
      table.string('name_mesero').nullable()
      table.string('apertura').nullable()
      table.string('cierre').nullable()
      table.string('cajero').nullable()
      table.decimal('efectivo').nullable()
      table.decimal('vales').nullable()
      table.decimal('tarjeta').nullable()
      table.decimal('credito').nullable()
      table.decimal('fondo').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
