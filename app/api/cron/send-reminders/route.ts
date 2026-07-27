import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
import { sendPush } from '@/lib/push'
import { TRIGGER_OPTIONS, SUBSTITUTE_OPTIONS } from '@/lib/respira-content'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export async function GET(request: NextRequest) {
  // proteção simples contra chamadas externas indevidas
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // horário de Brasília (America/Sao_Paulo)
  const now = new Date()
  const brasiliaStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour12: false })
  const brasilia = new Date(brasiliaStr)
  const currentDay = DAY_KEYS[brasilia.getDay()]
  const currentHour = brasilia.getHours()
  const currentMinute = brasilia.getMinutes()

  // janela de 15 minutos — pega planos cujo horário caia dentro da janela atual do cron
  const plans = await sql`
    SELECT ep.id, ep.user_id, ep.trigger_tag, ep.substitute, ep.reminder_time, ep.reminder_days
    FROM quit_emergency_plans ep
    WHERE ep.reminder_time IS NOT NULL
      AND EXTRACT(HOUR FROM ep.reminder_time) = ${currentHour}
      AND EXTRACT(MINUTE FROM ep.reminder_time) >= ${Math.floor(currentMinute / 15) * 15}
      AND EXTRACT(MINUTE FROM ep.reminder_time) < ${Math.floor(currentMinute / 15) * 15 + 15}
      AND ep.reminder_days ? ${currentDay}
      AND NOT EXISTS (
        SELECT 1 FROM push_send_log l WHERE l.plan_id = ep.id AND l.send_date = CURRENT_DATE
      )`

  let sent = 0
  let failed = 0

  for (const plan of plans) {
    const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ${plan.user_id}`
    if (subs.length === 0) continue

    const triggerLabel = TRIGGER_OPTIONS.find((t) => t.key === plan.trigger_tag)?.label || 'esse momento'
    const subLabel = SUBSTITUTE_OPTIONS.find((s) => s.key === plan.substitute)?.label || 'seu plano'

    let anySent = false
    for (const sub of subs) {
      const result = await sendPush(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        {
          title: 'Respira — Ô bicha!',
          body: `Agora costuma ser ${triggerLabel.toLowerCase()} pra você. Que tal ${subLabel.toLowerCase()} antes?`,
          url: '/respira',
        }
      )
      if (result.ok) { anySent = true } else if (result.statusCode === 410 || result.statusCode === 404) {
        // assinatura expirada/inválida — remove
        await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`
      }
    }

    if (anySent) {
      await sql`INSERT INTO push_send_log (plan_id, send_date) VALUES (${plan.id}, CURRENT_DATE) ON CONFLICT DO NOTHING`
      sent++
    } else {
      failed++
    }
  }

  return NextResponse.json({ ok: true, checked: plans.length, sent, failed })
}
