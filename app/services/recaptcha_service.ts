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
    return data?.success === true
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error)
    return false
  }
}
