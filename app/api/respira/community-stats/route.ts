import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET() {
  const [row] = await sql`
    WITH periods AS (
      SELECT started_at AS start_at, ended_at AS end_at, cigs_per_day FROM public.quit_attempts WHERE ended_at IS NOT NULL
      UNION ALL
      SELECT quit_at, now(), cigs_per_day FROM public.quit_profiles WHERE paused_at IS NULL AND quit_at<=now()
    )
    SELECT
      (SELECT count(*) FROM public.quit_profiles WHERE paused_at IS NULL AND quit_at<=now()) AS pessoas_ativas,
      COALESCE(sum(GREATEST(0,EXTRACT(EPOCH FROM (end_at-start_at))/86400)*cigs_per_day),0) AS cigarros_evitados,
      COALESCE(sum(GREATEST(0,EXTRACT(EPOCH FROM (end_at-start_at))/86400)),0) AS dias_somados
    FROM periods`

  return NextResponse.json({
    pessoasAtivas: Number(row.pessoas_ativas),
    cigarrosEvitados: Math.floor(Number(row.cigarros_evitados)),
    diasSomados: Math.floor(Number(row.dias_somados)),
  })
}
