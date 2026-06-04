import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/db'

export async function GET() {
  const posts = await getBlogPosts(false)
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.title?.trim()) {
      return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
    }

    // Garante content nunca null
    if (!data.content) data.content = ''

    // Gera slug
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        + '-' + Date.now()
    }

    const post = await createBlogPost(data)
    return NextResponse.json(post, { status: 201 })
  } catch (err: any) {
    console.error('Erro ao criar post:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    const post = await updateBlogPost(id, data)
    return NextResponse.json(post)
  } catch (err: any) {
    console.error('Erro ao atualizar post:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await deleteBlogPost(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}

