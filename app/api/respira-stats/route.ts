import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-access'
import { getRespiraStats } from '@/lib/db'
export async function GET(request:NextRequest) {
 const denied=await requireAdmin(request);if(denied)return denied
 return NextResponse.json(await getRespiraStats(),{headers:{'Cache-Control':'private, no-store'}})
}
