import env from '#start/env'

type ResendAttachment = {
  filename: string
  content: string
}

type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  from?: string
  attachments?: ResendAttachment[]
  apiKey?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  attachments,
  apiKey,
}: SendEmailInput) {
  const resolvedApiKey = apiKey || env.get('RESEND_API_KEY')
  const fromAddress = from || env.get('SMTP_FROM')

  if (!fromAddress) {
    throw new Error('Missing SMTP_FROM for email sender')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resolvedApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to,
        subject,
        html,
        attachments,
      }),
      signal: controller.signal,
    })

    let data: any = {}
    try {
      data = await res.json()
    } catch {}

    if (!res.ok) {
      const message = data?.message || data?.error?.message || `Resend API error (${res.status})`
      throw new Error(message)
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}
