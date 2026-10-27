import { requireAdmin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'
import { getPinterestPins, createPinterestPin, deletePinterestPin } from '@/lib/db'

export async function GET() {
  const pins = await getPinterestPins()
  return NextResponse.json(pins)
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const data = await request.json()
  const pin = await createPinterestPin(data)
  return NextResponse.json(pin, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const { id } = await request.json()
  await deletePinterestPin(id)
  return NextResponse.json({ ok: true })
}

