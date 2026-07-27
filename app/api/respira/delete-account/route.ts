import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

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

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Verifica a identidade usando o próprio token da pessoa (garante que só apaga a própria conta)
  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: userData, error: userError } = await anonClient.auth.getUser(token)
  if (userError || !userData.user) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const userId = userData.user.id
  const admin = createAdminSupabaseClient()

  for (const table of TABLES_TO_CLEAN) {
    await admin.from(table).delete().eq('user_id', userId)
  }

  // Remove também a conta de login em si (não só os dados do app)
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    // dados já apagados mesmo que a remoção do login falhe — reporta mas não trava
    return NextResponse.json({ ok: true, warning: 'Dados apagados, mas houve um erro ao remover o login: ' + deleteError.message })
  }

  return NextResponse.json({ ok: true })
}
