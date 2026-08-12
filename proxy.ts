import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Redireciona obicha.com.br (sem www) pra www.obicha.com.br — unifica o domínio pro Google
  if (host === 'obicha.com.br') {
    const url = new URL(request.url)
    url.hostname = 'www.obicha.com.br'
    return NextResponse.redirect(url, 308) // 308 = redirecionamento permanente
  }

  // Proteção das rotas de admin (login obrigatório)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto arquivos estáticos e internos do Next.js —
     * necessário pro redirecionamento de www funcionar em qualquer página, não só /admin
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
