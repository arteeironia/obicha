import { createClient } from '@supabase/supabase-js'

// ATENÇÃO: só usar em rotas de servidor (API routes). Nunca importar em componentes de cliente.
// Requer a variável de ambiente SUPABASE_SERVICE_ROLE_KEY configurada na Vercel
// (Supabase Dashboard → Project Settings → API → service_role key)
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
