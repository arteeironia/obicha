import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug obrigatório' }, { status: 400 })
  if (slug === '__all__') {
    const comments = await sql`SELECT * FROM blog_comments ORDER BY created_at DESC`
    return NextResponse.json(comments)
  }
  const comments = await sql`SELECT * FROM blog_comments WHERE post_slug = ${slug} ORDER BY created_at ASC`
  return NextResponse.json(comments)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { slug, content, parent_id } = await request.json()
    if (!slug || !content?.trim()) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    const [comment] = await sql`
      INSERT INTO blog_comments (post_slug, parent_id, user_id, user_name, user_avatar, user_email, content)
      VALUES (${slug}, ${parent_id || null}, ${user.id},
        ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'},
        ${user.user_metadata?.avatar_url || null}, ${user.email || null}, ${content.trim()})
      RETURNING *`
    return NextResponse.json(comment, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await sql`DELETE FROM blog_comments WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
