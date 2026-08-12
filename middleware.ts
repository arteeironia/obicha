import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Redireciona obicha.com.br (sem www) pra www.obicha.com.br — unifica o domínio pro Google
  if (host === 'obicha.com.br') {
    const url = new URL(request.url)
    url.hostname = 'www.obicha.com.br'
    return NextResponse.redirect(url, 308) // 308 = redirecionamento permanente, preserva o método da requisição
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto arquivos estáticos e internos do Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
