import { NextRequest, NextResponse } from 'next/server'
import { getSiteConfig, updateSiteConfig } from '@/lib/db'

export async function GET() {
  const config = await getSiteConfig()
  return NextResponse.json(config)
}

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json()
    for (const [key, value] of Object.entries(updates)) {
      await updateSiteConfig(key, value as string)
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
