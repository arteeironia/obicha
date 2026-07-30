import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET() {
  // Posts ocultados automaticamente (3+ denúncias), aguardando revisão de um admin
  const hidden = await sql`
    SELECT p.id, p.user_id, p.display_name, p.content, p.created_at,
      COUNT(r.id) as total_denuncias
    FROM quit_forum_posts p
    LEFT JOIN quit_forum_reports r ON r.post_id = p.id
    WHERE p.approved = false
    GROUP BY p.id
    ORDER BY p.created_at ASC`

  // Todos os posts com pelo menos 1 denúncia, inclusive os que ainda estão no ar —
  // dá pra remover antes mesmo de bater o limite de 3 que oculta automático
  const reported = await sql`
    SELECT
      p.id, p.user_id, p.display_name, p.content, p.created_at, p.approved,
      COUNT(r.id) as total_denuncias
    FROM quit_forum_posts p
    INNER JOIN quit_forum_reports r ON r.post_id = p.id
    GROUP BY p.id
    ORDER BY total_denuncias DESC, p.created_at DESC`

  const allPosts = await sql`
    SELECT id, user_id, display_name, content, created_at, approved
    FROM quit_forum_posts
    WHERE approved = true
    ORDER BY created_at DESC
    LIMIT 50`

  return NextResponse.json({ hidden, reported, allPosts })
}

export async function PATCH(request: NextRequest) {
  const { post_id, approved } = await request.json()
  if (!post_id) return NextResponse.json({ error: 'post_id obrigatório' }, { status: 400 })
  await sql`UPDATE quit_forum_posts SET approved = ${approved} WHERE id = ${post_id}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { post_id } = await request.json()
  if (!post_id) return NextResponse.json({ error: 'post_id obrigatório' }, { status: 400 })
  await sql`DELETE FROM quit_forum_posts WHERE id = ${post_id}`
  return NextResponse.json({ ok: true })
}
