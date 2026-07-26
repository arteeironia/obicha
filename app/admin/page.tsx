'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Product = { id: number; supplier: string | null }
type Category = { id: number; active: boolean }
type Collection = { id: number }
type BlogPost = { id: number; published: boolean }
type Comment = { id: number }
type RespiraStats = { total: number; recent: { display_name: string; quit_at: string; created_at: string }[] }

const cardStyle = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(212,168,67,0.2)',
  borderRadius: 4,
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={cardStyle} className="p-5">
      <p className="text-xs opacity-50 tracking-widest uppercase mb-2">{label}</p>
      <p className="font-bebas text-4xl" style={{ color: 'var(--gold)' }}>{value}</p>
      {sub && <p className="text-xs opacity-40 mt-1">{sub}</p>}
    </div>
  )
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 transition-all hover:opacity-100" style={{ ...cardStyle, opacity: 0.85 }}>
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  )
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [respiraStats, setRespiraStats] = useState<RespiraStats>({ total: 0, recent: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories?all=true').then(r => r.json()),
        fetch('/api/collections').then(r => r.json()),
        fetch('/api/blog').then(r => r.json()),
        fetch('/api/comments?slug=__all__').then(r => r.json()),
        fetch('/api/respira-stats').then(r => r.json()),
      ])
      if (results[0].status === 'fulfilled') setProducts(results[0].value)
      if (results[1].status === 'fulfilled') setCategories(results[1].value)
      if (results[2].status === 'fulfilled') setCollections(results[2].value)
      if (results[3].status === 'fulfilled') setPosts(results[3].value)
      if (results[4].status === 'fulfilled') setComments(results[4].value)
      if (results[5].status === 'fulfilled') setRespiraStats(results[5].value)
      setLoading(false)
    }
    load()
  }, [])

  const reservaInkCount = products.filter(p => p.supplier === 'reserva-ink-dtg').length
  const umaPencaCount = products.filter(p => p.supplier === 'uma-penca-dtf').length
  const activeCategories = categories.filter(c => c.active).length
  const publishedPosts = posts.filter(p => p.published).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Dashboard</h1>
        <p className="opacity-50 text-sm mt-1">Visão geral do site Ô bicha!</p>
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Produtos" value={products.length} sub={`${reservaInkCount} Reserva INK · ${umaPencaCount} Uma Penca`} />
            <StatCard label="Categorias ativas" value={activeCategories} sub={`${categories.length} no total`} />
            <StatCard label="Coleções" value={collections.length} />
            <StatCard label="Posts do blog" value={publishedPosts} sub={`${posts.length} no total`} />
          </div>

          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase opacity-50 mb-3">Comentários</p>
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Comentários no blog" value={comments.length} />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase opacity-50 mb-3">🫁 App Respira</p>
            <div className="grid grid-cols-4 gap-4 mb-3">
              <StatCard label="Pessoas cadastradas" value={respiraStats.total} />
            </div>
            {respiraStats.recent.length > 0 && (
              <div style={cardStyle} className="p-4">
                <p className="text-xs opacity-50 mb-2">Últimos cadastros</p>
                <div className="space-y-1.5">
                  {respiraStats.recent.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{r.display_name || 'Sem nome'}</span>
                      <span className="opacity-40 text-xs">{new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase opacity-50 mb-3">Atalhos</p>
            <div className="grid grid-cols-4 gap-3">
              <QuickLink href="/admin/produtos" label="Gerenciar Produtos" icon="👕" />
              <QuickLink href="/admin/categorias" label="Categorias" icon="🏷️" />
              <QuickLink href="/admin/destaques" label="Destaques" icon="✦" />
              <QuickLink href="/admin/blog" label="Blog" icon="✍️" />
              <QuickLink href="/admin/comentarios" label="Comentários" icon="💬" />
              <QuickLink href="/admin/links" label="Links" icon="🔗" />
              <QuickLink href="/admin/site-config" label="Links do Site" icon="⚙️" />
              <QuickLink href="/respira" label="App Respira" icon="🫁" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
