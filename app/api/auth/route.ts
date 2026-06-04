import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { updateAdminPassword } from '@/lib/db'

// POST /api/auth/logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('admin_token')
  return response
}

// POST /api/auth/password — troca de senha
export async function PATCH(request: NextRequest) {
  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'A nova senha deve ter ao menos 8 caracteres' }, { status: 400 })
  }

  const { getAdminConfig } = await import('@/lib/db')
  const config = await getAdminConfig()

  const valid = await bcrypt.compare(currentPassword, config.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 })
  }

  const newHash = await bcrypt.hash(newPassword, 12)
  await updateAdminPassword(newHash)

  return NextResponse.json({ ok: true })
}
