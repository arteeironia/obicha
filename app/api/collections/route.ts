import { NextRequest, NextResponse } from 'next/server'
import { getCollections, createCollection, updateCollection, deleteCollection } from '@/lib/db'

export async function GET() {
  const collections = await getCollections(false)
  return NextResponse.json(collections)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.title || !data.link) {
      return NextResponse.json({ error: 'Título e link são obrigatórios' }, { status: 400 })
    }
    const col = await createCollection(data)
    return NextResponse.json(col, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    const col = await updateCollection(id, data)
    return NextResponse.json(col)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await deleteCollection(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
