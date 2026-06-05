'use client'

import { useState, useEffect, useRef } from 'react'

type Collection = {
  id: number
  title: string
  description: string | null
  image_url: string | null
  link: string
  position: number
  active: boolean
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCol, setEditCol] = useState<Collection | null>(null)
  const [form, setForm] = useState({ title: '', description: '', link: '', position: 0, active: true, image_url: '' })
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch('/api/collections')
    setCollections(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditCol(null)
    setForm({ title: '', description: '', link: 'https://umapenca.com/obicha/', position: collections.length, active: true, image_url: '' })
    setImagePreview(null)
    setShowForm(true)
  }

  function openEdit(c: Collection) {
    setEditCol(c)
    setForm({ title: c.title, description: c.description || '', link: c.link, position: c.position, active: c.active, image_url: c.image_url || '' })
    setImagePreview(c.image_url)
    setShowForm(true)
  }

  async function handleImageUpload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setImagePreview(url)
    setForm(f => ({ ...f, image_url: url }))
  }

  async function handleSave() {
    if (!form.title.trim()) { alert('Título obrigatório!'); return }
    setSaving(true)
    const method = editCol ? 'PATCH' : 'POST'
    const body = editCol ? { id: editCol.id, ...form } : form
    await fetch('/api/collections', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta coleção?')) return
    await fetch('/api/collections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  async function toggleActive(col: Collection) {
    await fetch('/api/collections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: col.id, active: !col.active }),
    })
    await load()
  }

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Coleções em Destaque</h1>
          <p className="opacity-50 text-sm mt-1">{collections.length} coleções · aparecem no carrossel da landing page</p>
        </div>
        <button onClick={openAdd} className="px-6 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Nova Coleção
        </button>
      </div>

      <p className="text-sm opacity-40 mb-6">A ordem de exibição é controlada pelo campo "Posição" — menor número aparece primeiro.</p>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : collections.length === 0 ? (
        <div className="border border-dashed rounded p-12 text-center opacity-30" style={{ borderColor: 'rgba(212,168,67,.3)' }}>
          <p className="text-4xl mb-3">✦</p>
          <p>Nenhuma coleção ainda. Cria a primeira!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map(col => (
            <div key={col.id} className="flex items-center gap-4 p-4 border rounded" style={{ borderColor: 'rgba(212,168,67,.2)', background: 'rgba(255,255,255,.02)' }}>
              {col.image_url && (
                <img src={col.image_url} alt="" style={{ width:80, height:60, objectFit:'cover', borderRadius:2, flexShrink:0 }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{col.title}</p>
                {col.description && <p className="text-xs opacity-40 mt-1 truncate">{col.description}</p>}
                <p className="text-xs opacity-30 mt-1">Posição: {col.position} · {col.link}</p>
              </div>
              <span className="text-xs px-3 py-1 font-bebas tracking-widest flex-shrink-0" style={{
                background: col.active ? 'rgba(0,200,100,.1)' : 'rgba(255,255,255,.05)',
                color: col.active ? '#4ade80' : 'rgba(242,235,217,.4)',
                border: `1px solid ${col.active ? 'rgba(0,200,100,.3)' : 'rgba(255,255,255,.1)'}`,
              }}>
                {col.active ? 'Ativa' : 'Oculta'}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(col)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)' }}>
                  {col.active ? 'Ocultar' : 'Ativar'}
                </button>
                <button onClick={() => openEdit(col)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(255,255,255,.08)', color: 'var(--creme)' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(col.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,.15)', color: 'var(--red)' }}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--navy)', border: '1px solid var(--gold)', width: '90vw', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
              {editCol ? 'Editar Coleção' : 'Nova Coleção'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Título *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Coleção São Jorge" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Descrição curta</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Uma frase sobre a coleção..." />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Link *</label>
                <input style={inputStyle} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://umapenca.com/obicha/..." />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Posição (ordem de exibição)</label>
                <input style={inputStyle} type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Imagem de capa</label>
                <div
                  style={{ width:'100%', height:180, border:'2px dashed rgba(212,168,67,.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', borderRadius:2 }}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ opacity:.3, fontSize:'.85rem' }}>Clique para selecionar imagem</span>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="text-sm opacity-70">Exibir no carrossel</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,.2)', color: 'rgba(242,235,217,.5)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                {saving ? 'Salvando...' : editCol ? 'Salvar' : 'Criar Coleção'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
