import { isAdmin } from '@/lib/admin-access'
import { requireAdmin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'
import {
  getHighlights, createHighlight, updateHighlight, deleteHighlight,
  addHighlightImage, deleteHighlightImage, reorderHighlights
} from '@/lib/db'

export async function GET(request: NextRequest) {
  const highlights = await getHighlights(!await isAdmin(request))
  return NextResponse.json(highlights)
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const data = await request.json()
    if (!data.title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
    const h = await createHighlight(data)
    return NextResponse.json(h, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Não foi possível concluir a operação.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const { action, ...data } = await request.json()

    if (action === 'reorder') {
      await reorderHighlights(data.updates)
      return NextResponse.json({ ok: true })
    }

    if (action === 'add_image') {
      const img = await addHighlightImage(data.highlight_id, data.image_url, data.position ?? 0)
      return NextResponse.json(img)
    }

    if (action === 'delete_image') {
      await deleteHighlightImage(data.image_id)
      return NextResponse.json({ ok: true })
    }

    const { id, ...rest } = data
    const h = await updateHighlight(id, rest)
    return NextResponse.json(h)
  } catch (err: any) {
    return NextResponse.json({ error: 'Não foi possível concluir a operação.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const { id } = await request.json()
    await deleteHighlight(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Não foi possível concluir a operação.' }, { status: 500 })
  }
}

