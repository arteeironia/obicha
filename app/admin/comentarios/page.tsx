'use client'

import { useState, useEffect } from 'react'

type Comment = {
  id: number
  post_slug: string
  parent_id: number | null
  user_name: string
  user_avatar: string | null
  user_email: string | null
  content: string
  created_at: string
}

export default function AdminComentarios() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  async function load() {
    // Buscar todos os slugs dos posts e depois comentários
    const res = await fetch('/api/comments?slug=__all__')
    const data = await res.json()
    setComments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: number) {
    if (!confirm('Remover este comentário?')) return
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  const filtered = filter
    ? comments.filter(c => c.post_slug.includes(filter) || c.user_name.toLowerCase().includes(filter.toLowerCase()) || c.content.toLowerCase().includes(filter.toLowerCase()))
    : comments

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Comentários</h1>
          <p className="opacity-50 text-sm mt-1">{comments.length} comentários no total</p>
        </div>
        <input
          placeholder="Buscar por post, usuário ou conteúdo..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(212,168,67,.3)', color: 'var(--creme)', padding: '.6rem 1rem', outline: 'none', width: 280, fontSize: '.85rem' }}
        />
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed rounded p-12 text-center opacity-30" style={{ borderColor: 'rgba(212,168,67,.3)' }}>
          <p className="text-4xl mb-3">💬</p>
          <p>Nenhum comentário encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="border rounded p-4" style={{ borderColor: 'rgba(212,168,67,.15)', background: 'rgba(255,255,255,.02)' }}>
              <div className="flex items-start gap-3">
                {c.user_avatar
                  ? <img src={c.user_avatar} alt={c.user_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-bebas)', color: 'var(--navy)' }}>{c.user_name[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm">{c.user_name}</span>
                    {c.user_email && <span className="text-xs opacity-40">{c.user_email}</span>}
                    <span className="text-xs opacity-30">·</span>
                    <span className="text-xs opacity-40">Post: <span style={{ color: 'var(--gold)' }}>{c.post_slug}</span></span>
                    {c.parent_id && <span className="text-xs px-1.5 py-0.5" style={{ background: 'rgba(212,168,67,.1)', color: 'var(--gold)', fontSize: '.7rem' }}>Resposta</span>}
                    <span className="text-xs opacity-30 ml-auto">{new Date(c.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(242,235,217,.8)', lineHeight: 1.6 }}>{c.content}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest flex-shrink-0" style={{ background: 'rgba(192,40,28,.15)', color: 'var(--red)' }}>
                  ✕ Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
