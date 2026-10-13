import { NextRequest, NextResponse } from 'next/server'
import {isAdmin,sameOrigin} from '@/lib/admin-access'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const products = await getProducts(category)
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401})
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})
  const data = await request.json()
  const product = await createProduct(data)
  return NextResponse.json(product, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401})
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})
  const { id, ...data } = await request.json()
  const product = await updateProduct(id, data)
  if(!product)return NextResponse.json({error:'Esse cadastro foi atualizado enquanto você editava. Abra o produto novamente para conferir os dados atuais.'},{status:409})
  return NextResponse.json(product)
}

export async function DELETE(request: NextRequest) {
  if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401})
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})
  const { id } = await request.json()
  await deleteProduct(id)
  return NextResponse.json({ ok: true })
}
