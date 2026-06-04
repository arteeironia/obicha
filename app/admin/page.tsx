import { getProducts, getSocialPosts, getPinterestPins } from '@/lib/db'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [products, posts, pins] = await Promise.all([
    getProducts(),
    getSocialPosts(),
    getPinterestPins(),
  ])

  const stats = [
    { label: 'Produtos', value: products.length, href: '/admin/produtos', icon: '👕', color: 'var(--gold)' },
    { label: 'Posts Sociais', value: posts.length, href: '/admin/social', icon: '📱', color: 'var(--red)' },
    { label: 'Pins Pinterest', value: pins.length, href: '/admin/pinterest', icon: '📌', color: '#E60023' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>
          Bom dia, admin! 👋
        </h1>
        <p className="opacity-50 mt-1 text-sm">Gerencie o conteúdo da Ô bicha!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-6 border rounded transition-all hover:scale-105"
            style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}
          >
            <span className="text-3xl">{stat.icon}</span>
            <div className="mt-3">
              <div className="font-bebas text-5xl" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm opacity-50 tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="border rounded p-6" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bebas text-xl tracking-widest mb-4" style={{ color: 'var(--gold)' }}>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/produtos"
            className="px-4 py-3 text-sm tracking-widest uppercase font-bebas text-center transition-all"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
          >
            + Adicionar Produto
          </Link>
          <Link
            href="/admin/social"
            className="px-4 py-3 text-sm tracking-widest uppercase font-bebas text-center transition-all border"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            + Adicionar Post Social
          </Link>
          <Link
            href="/admin/pinterest"
            className="px-4 py-3 text-sm tracking-widest uppercase font-bebas text-center transition-all border"
            style={{ borderColor: '#E60023', color: '#E60023' }}
          >
            + Adicionar Pin Pinterest
          </Link>
          <Link
            href="/admin/configuracoes"
            className="px-4 py-3 text-sm tracking-widest uppercase font-bebas text-center transition-all border"
            style={{ borderColor: 'rgba(242,235,217,0.2)', color: 'rgba(242,235,217,0.5)' }}
          >
            ⚙ Configurações
          </Link>
        </div>
      </div>

      {/* Lembrete senha */}
      <div className="mt-6 p-4 border rounded text-sm" style={{ borderColor: 'rgba(192,40,28,0.4)', background: 'rgba(192,40,28,0.05)' }}>
        <span style={{ color: 'var(--red)' }}>⚠️ Lembrete:</span>
        <span className="opacity-60 ml-2">Se ainda estiver usando a senha temporária, </span>
        <Link href="/admin/configuracoes" className="underline" style={{ color: 'var(--gold)' }}>
          troque agora nas configurações.
        </Link>
      </div>
    </div>
  )
}
