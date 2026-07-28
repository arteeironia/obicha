import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET() {
  const content = await sql`
    SELECT id, type, title, body, url, source, description
    FROM quit_content
    WHERE active = true
    ORDER BY position ASC, created_at DESC`
  return NextResponse.json(content)
}
