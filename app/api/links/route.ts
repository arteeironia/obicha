import { NextRequest, NextResponse } from 'next/server'
import { getLinks, createLink, updateLink, deleteLink, reorderLinks, registerClick, getClickStats } from '@/lib/db-links'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('stats') === 'true') {
    const stats = await getClickStats()
    return NextResponse.json(stats)
  }
  const all = searchParams.get('all') === 'true'
  const links = await getLinks(!all)
  return NextResponse.json(links)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Registrar clique
    if (data.action === 'click') {
      await registerClick(data.link_id)
      return NextResponse.json({ ok: true })
    }

    if (!data.label || !data.url) {
      return NextResponse.json({ error: 'Label e URL obrigatórios' }, { status: 400 })
    }
    const link = await createLink(data)
    return NextResponse.json(link, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()
    if (action === 'reorder') {
      await reorderLinks(data.updates)
      return NextResponse.json({ ok: true })
    }
    const { id, ...rest } = data
    const link = await updateLink(id, rest)
    return NextResponse.json(link)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await deleteLink(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
