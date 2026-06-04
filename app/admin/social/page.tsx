'use client'

import { useState, useEffect } from 'react'

type Post = { id: number; platform: string; url: string; created_at: string }

const platforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
]

export default function AdminSocial() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ platform: 'instagram', url: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/social')
    setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!form.url.trim()) return
    setSaving(true)
    await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    await load()
    setForm({ platform: 'instagram', url: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este post?')) return
    await fetch('/api/social', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(212,168,67,0.3)',
    color: 'var(--creme)',
    width: '100%',
    padding: '0.7rem 1rem',
    outline: 'none',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Posts Sociais</h1>
          <p className="opacity-50 text-sm mt-1">Instagram e TikTok — {posts.length} posts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Adicionar Post
        </button>
      </div>

      <p className="text-sm opacity-50 mb-6">Cole o link direto do post. O embed é gerado automaticamente na landing page.</p>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : posts.length === 0 ? (
        <div className="border border-dashed rounded p-12 text-center opacity-30" style={{ borderColor: 'rgba(212,168,67,0.3)' }}>
          <p className="text-4xl mb-3">📱</p>
          <p>Nenhum post adicionado ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 border rounded" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
              <span className="font-bebas tracking-widest text-sm px-3 py-1" style={{
                background: post.platform === 'instagram' ? 'rgba(192,40,28,0.2)' : 'rgba(0,0,0,0.3)',
                color: post.platform === 'instagram' ? 'var(--red)' : 'var(--creme)',
                border: `1px solid ${post.platform === 'instagram' ? 'rgba(192,40,28,0.4)' : 'rgba(255,255,255,0.2)'}`,
              }}>
                {post.platform.toUpperCase()}
              </span>
              <span className="flex-1 text-sm opacity-60 truncate">{post.url}</span>
              <a href={post.url} target="_blank" className="text-xs opacity-40 hover:opacity-100 transition-opacity">↗</a>
              <button onClick={() => handleDelete(post.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,0.15)', color: 'var(--red)' }}>
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md p-8 border" style={{ background: 'var(--navy)', borderColor: 'var(--gold)' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>Novo Post Social</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Plataforma</label>
                <select style={{ ...inputStyle }} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                  {platforms.map(p => <option key={p.value} value={p.value} style={{ background: 'var(--navy)' }}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Link do Post</label>
                <input style={inputStyle} placeholder="https://www.instagram.com/p/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,0.2)', color: 'rgba(242,235,217,0.5)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
