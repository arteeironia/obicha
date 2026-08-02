import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET() {
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE quit_at <= now()) AS pessoas_ativas,
      COALESCE(SUM(
        GREATEST(0, EXTRACT(EPOCH FROM (now() - quit_at)) / 86400) * cigs_per_day
      ) FILTER (WHERE quit_at <= now()), 0) AS cigarros_evitados,
      COALESCE(SUM(
        GREATEST(0, EXTRACT(EPOCH FROM (now() - quit_at)) / 86400)
      ) FILTER (WHERE quit_at <= now()), 0) AS dias_somados
    FROM quit_profiles`

  return NextResponse.json({
    pessoasAtivas: Number(row.pessoas_ativas),
    cigarrosEvitados: Math.floor(Number(row.cigarros_evitados)),
    diasSomados: Math.floor(Number(row.dias_somados)),
  })
}
