import { rateLimited } from '@/lib/request-security'
import { sameOrigin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminConfig, updateAdminPassword } from '@/lib/db'
import { signToken } from '@/lib/auth'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})
  if(rateLimited('admin-login',request,10,15*60*1000))return NextResponse.json({error:'Muitas tentativas. Tente mais tarde.'},{status:429})
  let password: unknown
  try { ({password} = await request.json()) } catch { return NextResponse.json({error:'Dados inválidos.'},{status:400}) }

  if (typeof password !== 'string' || !password || Buffer.byteLength(password)>72) {
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

