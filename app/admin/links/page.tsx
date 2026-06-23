'use client'

import { useState, useEffect, useRef } from 'react'

type Link = { id: number; label: string; url: string; active: boolean; position: number }

const inputStyle = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(212,168,67,.3)',
  color: 'var(--creme)',
  width: '100%',
  padding: '.7rem 1rem',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '.9rem',
}

export default function AdminLinks() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editLink, setEditLink] = useState<Link | null>(null)
  const [form, setForm] = useState({ label: '', url: '', active: true })
  const [saving, setSaving] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  async function load() {
    const res = await fetch('/api/links?all=true')
    setLinks(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditLink(null)
    setForm({ label: '', url: '', active: true })
    setShowForm(true)
  }

  function openEdit(l: Link) {
    setEditLink(l)
    setForm({ label: l.label, url: l.url, active: l.active })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.label.trim() || !form.url.trim()) { alert('Label e URL obrigatórios!'); return }
    setSaving(true)
    const method = editLink ? 'PATCH' : 'POST'
    const body = editLink ? { id: editLink.id, ...form } : { ...form, position: links.length }
    await fetch('/api/links', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este link?')) return
    await fetch('/api/links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  async function toggleActive(l: Link) {
    await fetch('/api/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: l.id, active: !l.active }),
    })
    await load()
  }

  function handleDragStart(index: number) { dragItem.current = index }
  function handleDragEnter(index: number) { dragOver.current = index }
  async function handleDragEnd() {
    if (dragItem.current === null || dragOver.current === null) return
    const items = [...links]
    const dragged = items.splice(dragItem.current, 1)[0]
    items.splice(dragOver.current, 0, dragged)
    const updates = items.map((l, i) => ({ id: l.id, position: i }))
    setLinks(items)
    dragItem.current = null
    dragOver.current = null
    await fetch('/api/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', updates }),
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Links</h1>
          <p className="opacity-50 text-sm mt-1">
            Página pública: <a href="/links" target="_blank" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>obicha.com.br/links</a> · arraste para reordenar
          </p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 font-bebas tracking-widest text-sm" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Novo Link
        </button>
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {links.map((l, index) => (
            <div
              key={l.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-3 p-4 border rounded"
              style={{ borderColor: 'rgba(212,168,67,.2)', background: 'rgba(255,255,255,.02)', cursor: 'grab', opacity: l.active ? 1 : .5 }}
            >
              <span style={{ opacity: .4, fontSize: '1.2rem' }}>⠿</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-bold text-sm">{l.label}</p>
                <p className="text-xs opacity-40 truncate">{l.url}</p>
              </div>
              <span className="text-xs font-bebas" style={{ color: l.active ? '#4ade80' : 'rgba(242,235,217,.3)' }}>
                {l.active ? '● Ativo' : '○ Oculto'}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => toggleActive(l)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(242,235,217,.6)' }}>
                  {l.active ? 'Ocultar' : 'Ativar'}
                </button>
                <button onClick={() => openEdit(l)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(255,255,255,.08)', color: 'var(--creme)' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(l.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,.15)', color: 'var(--red)' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--navy)', border: '1px solid var(--gold)', width: '90vw', maxWidth: 480, padding: '2.5rem' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
              {editLink ? 'Editar Link' : 'Novo Link'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Label (texto do botão)</label>
                <input style={inputStyle} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex: Comprar Agora" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">URL</label>
                <input style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="text-sm opacity-70">Exibir na página de links</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,.2)', color: 'rgba(242,235,217,.5)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
