import { NextRequest, NextResponse } from 'next/server'
import { getProductsByCollection } from '@/lib/db-collections'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json([], { status: 400 })
  const products = await getProductsByCollection(slug)
  return NextResponse.json(products)
}
