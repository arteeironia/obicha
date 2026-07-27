import webpush from 'web-push'

let configured = false

function ensureConfigured() {
  if (configured) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contato@obicha.com.br',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  configured = true
}

export async function sendPush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: { title: string; body: string; url?: string }) {
  ensureConfigured()
  try {
    await webpush.sendNotification(subscription as any, JSON.stringify(payload))
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message, statusCode: err.statusCode }
  }
}
