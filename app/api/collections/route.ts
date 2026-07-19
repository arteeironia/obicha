import { NextRequest, NextResponse } from 'next/server'
import { getCollections, getProductCollections, setProductCollections } from '@/lib/db-collections'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')
  if (productId) {
    const cols = await getProductCollections(parseInt(productId))
    return NextResponse.json(cols)
  }
  const collections = await getCollections()
  return NextResponse.json(collections)
}

export async function POST(request: NextRequest) {
  try {
    const { product_id, collection_ids } = await request.json()
    await setProductCollections(product_id, collection_ids)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
