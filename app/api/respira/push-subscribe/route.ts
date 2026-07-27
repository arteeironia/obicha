import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

async function getUserFromToken(token: string | null) {
  if (!token) return null
  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data, error } = await anonClient.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { subscription } = await request.json()
  if (!subscription?.endpoint) return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })

  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${user.id}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
    ON CONFLICT (user_id, endpoint) DO NOTHING`

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { endpoint } = await request.json()
  if (endpoint) {
    await sql`DELETE FROM push_subscriptions WHERE user_id = ${user.id} AND endpoint = ${endpoint}`
  } else {
    await sql`DELETE FROM push_subscriptions WHERE user_id = ${user.id}`
  }
  return NextResponse.json({ ok: true })
}
