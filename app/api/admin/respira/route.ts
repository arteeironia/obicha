import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const TABLES_TO_CLEAN = [
  'quit_forum_reports',
  'quit_forum_reactions',
  'quit_forum_posts',
  'quit_relapses',
  'quit_milestones_marked',
  'quit_selfesteem_checks',
  'quit_movement_logs',
  'quit_daily_state',
  'quit_emergency_plans',
  'quit_cravings',
  'quit_profiles',
]

export async function GET() {
  const profiles = await sql`
    SELECT
      p.user_id, p.display_name, p.photo_url, p.quit_at, p.cigs_per_day, p.price_per_pack, p.cigs_per_pack,
      p.is_admin, p.created_at,
      (SELECT COUNT(*) FROM quit_cravings c WHERE c.user_id = p.user_id AND c.survived = true) as fissuras_vencidas,
      (SELECT COUNT(*) FROM quit_forum_posts f WHERE f.user_id = p.user_id) as posts_forum
    FROM quit_profiles p
    ORDER BY p.created_at DESC`
  return NextResponse.json(profiles)
}

export async function PATCH(request: NextRequest) {
  const { user_id, is_admin } = await request.json()
  if (!user_id) return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })
  await sql`UPDATE quit_profiles SET is_admin = ${is_admin} WHERE user_id = ${user_id}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { user_id } = await request.json()
  if (!user_id) return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })

  for (const table of TABLES_TO_CLEAN) {
    await sql.unsafe(`DELETE FROM ${table} WHERE user_id = $1`, [user_id])
  }

  const admin = createAdminSupabaseClient()
  const { error } = await admin.auth.admin.deleteUser(user_id)
  if (error) return NextResponse.json({ ok: true, warning: 'Dados apagados, mas houve erro ao remover o login: ' + error.message })

  return NextResponse.json({ ok: true })
}
