import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminConfig, updateAdminPassword } from '@/lib/db'
import { signToken } from '@/lib/auth'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password) {
    return NextResponse.json({ error: 'Senha obrigatória' }, { status: 400 })
  }

  const config = await getAdminConfig()
  if (!config) {
    return NextResponse.json({ error: 'Admin não configurado' }, { status: 500 })
  }

  const valid = await bcrypt.compare(password, config.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const token = await signToken({ role: 'admin' })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })

  return response
}
