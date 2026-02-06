/* eslint-disable @typescript-eslint/naming-convention */
/**
 * start/env.ts
 */

import { Env } from '@adonisjs/core/env'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

/* 1. Convertimos la URL base en una ruta absoluta */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const appRootPath = resolve(__dirname, '..') // esto es un string

/* 2. Detectamos NODE_ENV o usamos 'development' por defecto */
const nodeEnv = process.env.NODE_ENV || 'development'

/* 3. Elegimos el archivo .env correspondiente */
let envFile: string
switch (nodeEnv) {
  case 'dev':
    envFile = '.env.dev'
    break
  case 'main':
    envFile = '.env.main'
    break
  case 'production':
    envFile = '.env.production'
    break
  default:
    envFile = '.env'
}

/* 4. Configuramos el path del archivo .env */
process.env.ENV_PATH = appRootPath
process.env.ENV_FILENAME = envFile

/* 5. Creamos la instancia de Env usando la ruta como URL */
export default await Env.create(new URL(`file://${appRootPath}/`), {
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
  SMTP_PORT: Env.schema.number(),
  SMTP_SECURE: Env.schema.boolean(),
  SMTP_FROM: Env.schema.string.optional(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  // --- Resend API
  RESEND_API_KEY: Env.schema.string(),
  RESEND_API_KEY_GROWTHSUITE: Env.schema.string(),

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
