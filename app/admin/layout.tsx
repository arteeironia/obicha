'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/produtos', label: 'Produtos', icon: '👕' },
  { href: '/admin/collections', label: 'Coleções', icon: '✦' },
  { href: '/admin/social', label: 'Posts Sociais', icon: '📱' },
  { href: '/admin/pinterest', label: 'Pinterest', icon: '📌' },
  { href: '/admin/blog', label: 'Blog', icon: '✍️' },
  { href: '/admin/site-config', label: 'Links do Site', icon: '🔗' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1a2e' }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'var(--navy)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(212,168,67,0.2)' }}>
          <Link href="/" className="font-bebas text-3xl" style={{ color: 'var(--gold)' }}>
            Ô<span style={{ color: 'var(--red)' }}>bicha</span>!
          </Link>
          <p className="text-xs opacity-40 tracking-widest uppercase mt-1">Painel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded transition-all text-sm tracking-wide"
              style={{
                background: pathname === item.href ? 'rgba(212,168,67,0.1)' : 'transparent',
                color: pathname === item.href ? 'var(--gold)' : 'rgba(242,235,217,0.6)',
                borderLeft: pathname === item.href ? '3px solid var(--gold)' : '3px solid transparent',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(212,168,67,0.2)' }}>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            ↗ Ver site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-xs tracking-widest uppercase transition-all mt-1"
            style={{ color: 'var(--red)', border: '1px solid rgba(192,40,28,0.3)' }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
