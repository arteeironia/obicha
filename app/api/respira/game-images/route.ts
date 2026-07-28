import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

// Corta o fundo branco/liso das fotos de produto, focando no conteúdo (gravity: auto)
// pra virarem peças de jogo reconhecíveis, não quadrados brancos.
function cropForGame(url: string) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', '/upload/c_fill,g_auto,ar_1:1,w_900,q_auto/')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '8'), 12)

  const rows = await sql`
    SELECT id, name, image_url FROM products
    WHERE image_url IS NOT NULL AND image_url != ''
    ORDER BY RANDOM()
    LIMIT ${count}`

  const cropped = rows.map((r) => ({ ...r, image_url: cropForGame(r.image_url) }))
  return NextResponse.json(cropped)
}
