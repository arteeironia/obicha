import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const products = await getProducts(category)
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const product = await createProduct(data)
  return NextResponse.json(product, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  const product = await updateProduct(id, data)
  return NextResponse.json(product)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await deleteProduct(id)
  return NextResponse.json({ ok: true })
}
