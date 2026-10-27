import { requireAdmin, isAdmin, sameOrigin } from '@/lib/admin-access'
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
    const denied = await requireAdmin(request)
    if (denied) return denied
    const comments = await sql`SELECT * FROM blog_comments ORDER BY created_at DESC`
    return NextResponse.json(comments)
  }
  const comments = await sql`SELECT id, post_slug, parent_id, user_id, user_name, user_avatar, content, created_at FROM blog_comments WHERE post_slug = ${slug} ORDER BY created_at ASC`
  return NextResponse.json(comments)
}

export async function POST(request: NextRequest) {
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})

  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { slug, content, parent_id } = await request.json()
    if (typeof slug !== 'string' || slug.length > 200 || typeof content !== 'string' || content.length > 10000 || !content.trim()) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    const [comment] = await sql`
      INSERT INTO blog_comments (post_slug, parent_id, user_id, user_name, user_avatar, user_email, content)
      VALUES (${slug}, ${parent_id || null}, ${user.id},
        ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'},
        ${user.user_metadata?.avatar_url || null}, ${user.email || null}, ${content.trim()})
      RETURNING *`
    return NextResponse.json(comment, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Não foi possível concluir a operação.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await isAdmin(request)
  const user = admin ? null : await getUser(request)
  if(!admin && !user)return NextResponse.json({error:'Não autorizado.'},{status:401})
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})

  try {
    const { id } = await request.json()
    if(!Number.isSafeInteger(id) || id<=0)return NextResponse.json({error:'Comentário inválido.'},{status:400})
    if(admin)await sql`DELETE FROM blog_comments WHERE id = ${id}`
    else await sql`DELETE FROM blog_comments WHERE id = ${id} AND user_id = ${user!.id}`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Não foi possível concluir a operação.' }, { status: 500 })
  }
}

