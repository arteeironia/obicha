import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

function reply(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

async function identity(request: NextRequest) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser(token)
  return error ? null : data.user
}

export async function GET(request: NextRequest) {
  try {
    const user = await identity(request)
    if (!user) return reply({ error: 'Entre na sua conta do Respira.' }, 401)
    const [classic, extreme, [own]] = await Promise.all([
      sql`select nickname, classic as score from public.quit_setas_ranking where classic > 0 order by classic desc, nickname limit 30`,
      sql`select nickname, extreme as score from public.quit_setas_ranking where extreme > 0 order by extreme desc, nickname limit 30`,
      sql`select nickname, classic, extreme from public.quit_setas_ranking where user_id = ${user.id}`,
    ])
    return reply({ classic, extreme, own: own ?? null })
  } catch {
    return reply({ error: 'O ranking está indisponível agora.' }, 503)
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return reply({ error: 'Origem inválida.' }, 403)
  try {
    const user = await identity(request)
    if (!user) return reply({ error: 'Entre na sua conta do Respira.' }, 401)
    const raw = await request.text()
    if (Buffer.byteLength(raw) > 600) return reply({ error: 'Dados muito grandes.' }, 413)
    const input = JSON.parse(raw)
    if (input?.action === 'leave') {
      await sql`delete from public.quit_setas_ranking where user_id = ${user.id}`
      return reply({ ok: true })
    }

    const nickname = typeof input?.nickname === 'string' ? input.nickname.trim().normalize('NFC') : ''
    const validScore = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100000
    if (input?.action !== 'publish' || !/^[\p{L}\p{M}\p{N} _-]{2,24}$/u.test(nickname)
        || !validScore(input.classic) || !validScore(input.extreme)) {
      return reply({ error: 'Use de 2 a 24 letras, números, espaços, hífens ou sublinhados no apelido.' }, 400)
    }
    if (!input.classic && !input.extreme) return reply({ error: 'Conclua uma fase antes de publicar.' }, 400)
    await sql`
      insert into public.quit_setas_ranking (user_id, nickname, classic, extreme)
      values (${user.id}, ${nickname}, ${input.classic}, ${input.extreme})
      on conflict (user_id) do update set
        nickname = excluded.nickname,
        classic = greatest(quit_setas_ranking.classic, excluded.classic),
        extreme = greatest(quit_setas_ranking.extreme, excluded.extreme)
    `
    return reply({ ok: true })
  } catch (error) {
    return error instanceof SyntaxError
      ? reply({ error: 'Dados inválidos.' }, 400)
      : reply({ error: 'Não foi possível atualizar o ranking agora.' }, 503)
  }
}
