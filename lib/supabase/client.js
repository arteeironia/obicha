import { createClient } from "@supabase/supabase-js";

// Usa as MESMAS variáveis de ambiente que os comentários do blog já usam.
// Se o projeto já tem um client Supabase em outro arquivo (ex: lib/supabase.js),
// pode substituir os imports abaixo por ele e apagar este arquivo.
export function createBrowserSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
