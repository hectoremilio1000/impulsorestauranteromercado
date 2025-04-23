/**
 * start/env.ts
 */
import { Env } from '@adonisjs/core/env'

/**
 * 1. Detectamos NODE_ENV (por defecto, 'development')
 */
const nodeEnv = process.env.NODE_ENV || 'development'

/**
 * 2. Definimos cuál archivo .env usar según NODE_ENV.
 */
let envFile = '.env'
if (nodeEnv === 'dev') {
  envFile = '.env.dev'
} else if (nodeEnv === 'main') {
  envFile = '.env.main'
} else if (nodeEnv === 'production') {
  envFile = '.env.production'
} else {
  envFile = '.env'
}

/**
 * 3. Construimos un URL absoluto usando `import.meta.url`.
 *    Así evitamos `__dirname` y satisfacemos la API de Env.create()
 */
const appRoot = new URL('..', import.meta.url)

/**
 * 4. Creamos la instancia de Env, con nuestras validaciones
 */
export default await Env.create(appRoot, {
  NODE_ENV: Env.schema.enum(['development', 'dev', 'main', 'production', 'test'] as const),

  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),

  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  FRONTEND_URL: Env.schema.string(),

  // --- DB
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // --- Mail
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  // --- Mercadopago
  MP_ACCESS_TOKEN: Env.schema.string(),
  MP_PUBLIC_KEY: Env.schema.string.optional(),

  // --- App URL
  APP_URL: Env.schema.string(),

  // --- Google Ads
  CLIENT_ID: Env.schema.string(),
  CLIENT_SECRET: Env.schema.string(),
  DEVELOPER_TOKEN: Env.schema.string(),
  MANAGER_CUSTOMER_ID: Env.schema.string(),
  CUSTOMER_ID: Env.schema.string(),
  REDIRECT_URL: Env.schema.string(),
  REDIRECT_URL_FRONT: Env.schema.string(),

  // --- Calendly
  CALENDLY_CLIENT_ID: Env.schema.string(),
  CALENDLY_CLIENT_SECRET: Env.schema.string(),
  CALENDLY_AUTH_BASE_URL: Env.schema.string(),
  CALENDLY_API_BASE_URL: Env.schema.string(),
  CALENDLY_REDIRECT_URI: Env.schema.string(),
  CALENDLY_BASE_URL: Env.schema.string(),

  // --- Sesiones
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  // --- Lock store
  LOCK_STORE: Env.schema.enum(['database', 'memory'] as const),
})
