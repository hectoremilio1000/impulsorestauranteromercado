import env from '#start/env'

/**
 * Verifica un token de reCAPTCHA v2 contra la API de Google (server-side).
 * Devuelve true solo si Google confirma que el usuario pasó el "No soy un robot".
 */
export async function verifyRecaptcha(token: string, remoteip?: string): Promise<boolean> {
  if (!token) return false

  const params = new URLSearchParams({
    secret: env.get('RECAPTCHA_SECRET_KEY'),
    response: token,
  })
  if (remoteip) params.set('remoteip', remoteip)

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const data: any = await res.json()
    if (data?.success !== true) {
      // Log de diagnóstico: los error-codes de Google dicen la causa exacta —
      // 'invalid-input-secret' (secret mal en el server), 'invalid-input-response'
      // (token inválido/expirado/duplicado), o hostname no registrado.
      console.error('reCAPTCHA verify falló:', {
        errorCodes: data?.['error-codes'],
        hostname: data?.hostname,
      })
    }
    return data?.success === true
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error)
    return false
  }
}
