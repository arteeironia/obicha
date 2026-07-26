import { NextResponse } from 'next/server'
import { getRespiraStats } from '@/lib/db'

export async function GET() {
  const stats = await getRespiraStats()
  return NextResponse.json(stats)
}
