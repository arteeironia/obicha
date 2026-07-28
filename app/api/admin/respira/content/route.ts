import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET() {
  const content = await sql`SELECT * FROM quit_content ORDER BY type ASC, position ASC, created_at DESC`
  return NextResponse.json(content)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const [row] = await sql`
    INSERT INTO quit_content (type, title, body, url, source, description, position, active)
    VALUES (${data.type}, ${data.title}, ${data.body || null}, ${data.url || null}, ${data.source || null}, ${data.description || null}, ${data.position ?? 0}, ${data.active ?? true})
    RETURNING *`
  return NextResponse.json(row, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  const [row] = await sql`
    UPDATE quit_content SET
      type = COALESCE(${data.type ?? null}, type),
      title = COALESCE(${data.title ?? null}, title),
      body = ${data.body !== undefined ? data.body : sql`body`},
      url = ${data.url !== undefined ? data.url : sql`url`},
      source = ${data.source !== undefined ? data.source : sql`source`},
      description = ${data.description !== undefined ? data.description : sql`description`},
      position = COALESCE(${data.position ?? null}, position),
      active = COALESCE(${data.active ?? null}, active)
    WHERE id = ${id}
    RETURNING *`
  return NextResponse.json(row)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await sql`DELETE FROM quit_content WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
