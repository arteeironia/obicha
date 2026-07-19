import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const onlyActive = searchParams.get('all') !== 'true'
  const categories = onlyActive
    ? await sql`SELECT * FROM categories WHERE active = true ORDER BY position ASC`
    : await sql`SELECT * FROM categories ORDER BY position ASC`
  return NextResponse.json(categories)
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, active, position, label } = await request.json()
    const [cat] = await sql`
      UPDATE categories SET
        active = COALESCE(${active ?? null}, active),
        position = COALESCE(${position ?? null}, position),
        label = COALESCE(${label ?? null}, label)
      WHERE id = ${id} RETURNING *`
    return NextResponse.json(cat)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
