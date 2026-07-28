'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/produtos', label: 'Produtos', icon: '👕' },
  { href: '/admin/categorias', label: 'Categorias', icon: '🏷️' },
  { href: '/admin/destaques', label: 'Destaques', icon: '✦' },
  { href: '/admin/blog', label: 'Blog', icon: '✍️' },
  { href: '/admin/comentarios', label: 'Comentários', icon: '💬' },
  { href: '/admin/links', label: 'Links', icon: '🔗' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/auditoria-cliques', label: 'Auditoria de Cliques', icon: '📊' },
  { href: '/admin/site-config', label: 'Links do Site', icon: '⚙️' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
  { href: '/admin/respira', label: 'Respira — Gerenciar', icon: '🫁' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen md:flex" style={{ background: '#0f1a2e' }}>
      {/* Botão hambúrguer — só aparece no celular */}
      <button
        onClick={() => setMenuOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-11 h-11 flex items-center justify-center"
        style={{ background: 'rgba(15,26,46,.95)', border: '1px solid rgba(212,168,67,.3)' }}
        aria-label="Abrir menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 5h16M2 10h16M2 15h16" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Fundo escuro atrás do menu aberto no celular */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,.6)' }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`w-64 flex flex-col border-r fixed md:sticky top-0 left-0 h-screen z-50 transition-transform duration-200 md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderColor: 'rgba(212,168,67,.2)', background: 'var(--navy)' }}
      >
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(212,168,67,.2)' }}>
          <div>
            <Link href="/" className="font-bebas text-3xl" style={{ color: 'var(--gold)' }}>
              Ô<span style={{ color: 'var(--red)' }}>bicha</span>!
            </Link>
            <p className="text-xs opacity-40 tracking-widest uppercase mt-1">Painel Admin</p>
          </div>
          <button onClick={() => setMenuOpen(false)} className="md:hidden opacity-60" aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded transition-all text-sm tracking-wide"
              style={{
                background: pathname === item.href ? 'rgba(212,168,67,.1)' : 'transparent',
                color: pathname === item.href ? 'var(--gold)' : 'rgba(242,235,217,.6)',
                borderLeft: pathname === item.href ? '3px solid var(--gold)' : '3px solid transparent',
              }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(212,168,67,.2)' }}>
          <Link href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-xs opacity-50 hover:opacity-100 transition-opacity">↗ Ver site</Link>
          <button onClick={handleLogout} className="w-full px-4 py-2 text-xs tracking-widest uppercase transition-all mt-1" style={{ color: 'var(--red)', border: '1px solid rgba(192,40,28,.3)' }}>Sair</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0 pt-16 md:pt-0">{children}</main>
    </div>
  )
}
