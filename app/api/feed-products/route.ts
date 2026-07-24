import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const offset = (page - 1) * limit

  const products = source
    ? await sql`
        SELECT fp.*, json_agg(fv.* ORDER BY fv.variant_type ASC) as variants
        FROM feed_products fp
        LEFT JOIN feed_variants fv ON fv.feed_product_id = fp.id
        WHERE fp.active = true AND fp.source = ${source}
        ${search ? sql`AND fp.name ILIKE ${'%' + search + '%'}` : sql``}
        GROUP BY fp.id
        ORDER BY fp.name ASC
        LIMIT ${limit} OFFSET ${offset}`
    : await sql`
        SELECT fp.*, json_agg(fv.* ORDER BY fv.variant_type ASC) as variants
        FROM feed_products fp
        LEFT JOIN feed_variants fv ON fv.feed_product_id = fp.id
        WHERE fp.active = true
        ${search ? sql`AND fp.name ILIKE ${'%' + search + '%'}` : sql``}
        GROUP BY fp.id
        ORDER BY fp.source ASC, fp.name ASC
        LIMIT ${limit} OFFSET ${offset}`

  const [{ count }] = await sql`
    SELECT COUNT(*) FROM feed_products WHERE active = true
    ${source ? sql`AND source = ${source}` : sql``}
    ${search ? sql`AND name ILIKE ${'%' + search + '%'}` : sql``}`

  return NextResponse.json({ products, total: parseInt(count) })
}

export async function PATCH(request: NextRequest) {
  const { id, scene_image_url, active } = await request.json()
  const [product] = await sql`
    UPDATE feed_products SET
      scene_image_url = COALESCE(${scene_image_url ?? null}, scene_image_url),
      active = COALESCE(${active ?? null}, active),
      updated_at = NOW()
    WHERE id = ${id} RETURNING *`
  return NextResponse.json(product)
}
