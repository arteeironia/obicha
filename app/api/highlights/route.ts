import { NextRequest, NextResponse } from 'next/server'
import {
  getHighlights, createHighlight, updateHighlight, deleteHighlight,
  addHighlightImage, deleteHighlightImage, reorderHighlights
} from '@/lib/db'

export async function GET() {
  const highlights = await getHighlights(false)
  return NextResponse.json(highlights)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
    const h = await createHighlight(data)
    return NextResponse.json(h, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await deleteHighlight(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
