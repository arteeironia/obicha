import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '8'), 12)

  const rows = await sql`
    SELECT id, name, image_url FROM products
    WHERE image_url IS NOT NULL AND image_url != ''
    ORDER BY RANDOM()
    LIMIT ${count}`

  return NextResponse.json(rows)
}
