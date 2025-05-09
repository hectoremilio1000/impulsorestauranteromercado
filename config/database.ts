import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'mysql',

  connections: {
    mysql: {
      client: 'mysql2',
      debug: env.get('NODE_ENV') === 'development',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      pool: {
        min: 0,
        max: 5,

        /* destruye conexiones ociosas antes de que MySQL las cierre (15 s) */
        idleTimeoutMillis: 10_000,

        /* verifica el socket antes de entregarlo */
        afterCreate(conn: any, done: (err: Error | null, conn: any) => void) {
          conn.query('SELECT 1', (err: Error) => done(err, conn))
        },
      },

      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      seeders: {
        paths: ['./database/seeders'],
      },
    },
  },
})

export default dbConfig
