'use client'

import { useState, useEffect, useRef } from 'react'

type HImage = { id: number; highlight_id: number; image_url: string; position: number }
type Highlight = {
  id: number; type: string; title: string; position: number; active: boolean
  original_price: string | null; promo_price: string | null
  expires_at: string | null; link: string | null
  images: HImage[] | null
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

export default function AdminDestaques() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editH, setEditH] = useState<Highlight | null>(null)
  const [formType, setFormType] = useState<'collection' | 'promotion'>('collection')
  const [form, setForm] = useState({
    title: '', active: true, position: 0,
    original_price: '', promo_price: '', expires_at: '', link: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  async function load() {
    const res = await fetch('/api/highlights')
    setHighlights(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd(type: 'collection' | 'promotion') {
    setEditH(null)
    setFormType(type)
    setForm({ title: '', active: true, position: highlights.length, original_price: 'R$ ', promo_price: 'R$ ', expires_at: '', link: '' })
    setShowForm(true)
  }

  function openEdit(h: Highlight) {
    setEditH(h)
    setFormType(h.type as any)
    setForm({
      title: h.title, active: h.active, position: h.position,
      original_price: h.original_price || 'R$ ',
      promo_price: h.promo_price || 'R$ ',
      expires_at: h.expires_at ? h.expires_at.slice(0, 16) : '',
      link: h.link || ''
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { alert('Título obrigatório!'); return }
    setSaving(true)
    const method = editH ? 'PATCH' : 'POST'
    const body = editH
      ? { id: editH.id, ...form, type: formType }
      : { ...form, type: formType }
    await fetch('/api/highlights', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este destaque e todas as imagens?')) return
    await fetch('/api/highlights', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  async function toggleActive(h: Highlight) {
    await fetch('/api/highlights', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: h.id, active: !h.active }),
    })
    await load()
  }

  async function handleMultiUpload(files: FileList, highlightId: number) {
    setUploading(true)
    const existing = highlights.find(h => h.id === highlightId)?.images || []
    let pos = existing.length

    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      await fetch('/api/highlights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_image', highlight_id: highlightId, image_url: url, position: pos }),
      })
      pos++
    }
    await load()
    setUploading(false)
  }

  async function handleDeleteImage(imageId: number) {
    if (!confirm('Remover esta imagem?')) return
    await fetch('/api/highlights', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_image', image_id: imageId }),
    })
    await load()
  }

  // Drag to reorder highlights
  function handleDragStart(index: number) { dragItem.current = index }
  function handleDragEnter(index: number) { dragOver.current = index }
  async function handleDragEnd() {
    if (dragItem.current === null || dragOver.current === null) return
    const items = [...highlights]
    const dragged = items.splice(dragItem.current, 1)[0]
    items.splice(dragOver.current, 0, dragged)
    const updates = items.map((h, i) => ({ id: h.id, position: i }))
    setHighlights(items)
    dragItem.current = null
    dragOver.current = null
    await fetch('/api/highlights', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', updates }),
    })
  }

  const isExpired = (h: Highlight) => h.expires_at ? new Date(h.expires_at) < new Date() : false

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Destaques</h1>
          <p className="opacity-50 text-sm mt-1">Coleções e promoções que aparecem no carrossel · arraste para reordenar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openAdd('collection')} className="px-5 py-2.5 font-bebas tracking-widest text-sm" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
            + Coleção
          </button>
          <button onClick={() => openAdd('promotion')} className="px-5 py-2.5 font-bebas tracking-widest text-sm border" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
            + Promoção
          </button>
        </div>
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : highlights.length === 0 ? (
        <div className="border border-dashed rounded p-12 text-center opacity-30" style={{ borderColor: 'rgba(212,168,67,.3)' }}>
          <p className="text-4xl mb-3">✦</p>
          <p>Nenhum destaque ainda. Cria uma coleção ou promoção!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {highlights.map((h, index) => (
            <div
              key={h.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="border rounded overflow-hidden"
              style={{ borderColor: 'rgba(212,168,67,.2)', background: 'rgba(255,255,255,.02)', cursor: 'grab' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4">
                <span style={{ opacity:.4, fontSize:'1.2rem' }}>⠿</span>
                <span className="text-xs px-2 py-0.5 font-bebas tracking-widest" style={{
                  background: h.type === 'promotion' ? 'rgba(192,40,28,.2)' : 'rgba(212,168,67,.15)',
                  color: h.type === 'promotion' ? 'var(--red)' : 'var(--gold)',
                  border: `1px solid ${h.type === 'promotion' ? 'rgba(192,40,28,.4)' : 'rgba(212,168,67,.3)'}`,
                }}>
                  {h.type === 'promotion' ? 'Promoção' : 'Coleção'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{h.title}</p>
                  <p className="text-xs opacity-40 mt-0.5">
                    {(h.images || []).length} imagens
                    {h.type === 'promotion' && h.expires_at && (
                      <span style={{ color: isExpired(h) ? 'var(--red)' : '#4ade80' }}>
                        {' · '}{isExpired(h) ? 'Expirado' : `Expira em ${new Date(h.expires_at).toLocaleDateString('pt-BR')}`}
                      </span>
                    )}
                  </p>
                </div>
                {/* Preview de imagens */}
                <div className="flex gap-1">
                  {(h.images || []).slice(0, 3).map(img => (
                    <img key={img.id} src={img.image_url} alt="" style={{ width:40, height:40, objectFit:'cover', borderRadius:2 }} />
                  ))}
                  {(h.images || []).length > 3 && (
                    <div style={{ width:40, height:40, background:'rgba(212,168,67,.1)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', color:'var(--gold)' }}>
                      +{(h.images || []).length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs px-2 py-1 font-bebas" style={{
                  color: h.active && !isExpired(h) ? '#4ade80' : 'rgba(242,235,217,.3)',
                }}>
                  {h.active && !isExpired(h) ? '● Ativo' : '○ Inativo'}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => setExpandedId(expandedId === h.id ? null : h.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,.1)', color: 'var(--gold)' }}>
                    {expandedId === h.id ? 'Fechar' : 'Imagens'}
                  </button>
                  <button onClick={() => toggleActive(h)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(242,235,217,.6)' }}>
                    {h.active ? 'Ocultar' : 'Ativar'}
                  </button>
                  <button onClick={() => openEdit(h)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(255,255,255,.08)', color: 'var(--creme)' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,.15)', color: 'var(--red)' }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Imagens expandidas */}
              {expandedId === h.id && (
                <div style={{ padding:'1rem 1.5rem 1.5rem', borderTop:'1px solid rgba(212,168,67,.1)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:'.75rem', marginBottom:'1rem' }}>
                    {(h.images || []).map(img => (
                      <div key={img.id} style={{ position:'relative', aspectRatio:1 }}>
                        <img src={img.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:4, display:'block' }} />
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          style={{ position:'absolute', top:4, right:4, background:'rgba(192,40,28,.9)', border:'none', color:'white', width:22, height:22, borderRadius:'50%', cursor:'pointer', fontSize:'.7rem', display:'flex', alignItems:'center', justifyContent:'center' }}
                        >✕</button>
                      </div>
                    ))}
                    {/* Botão de upload */}
                    <label style={{ aspectRatio:1, border:'2px dashed rgba(212,168,67,.3)', borderRadius:4, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:'.3rem', transition:'border-color .3s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor='var(--gold)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(212,168,67,.3)')}
                    >
                      <span style={{ fontSize:'1.5rem', opacity:.4 }}>+</span>
                      <span style={{ fontSize:'.65rem', opacity:.4, textAlign:'center', letterSpacing:'1px' }}>
                        {uploading ? 'Subindo...' : 'Adicionar'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display:'none' }}
                        onChange={e => e.target.files && handleMultiUpload(e.target.files, h.id)}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p style={{ fontSize:'.72rem', opacity:.35 }}>Selecione múltiplas imagens de uma vez para fazer upload em lote.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--navy)', border: `1px solid ${formType === 'promotion' ? 'var(--red)' : 'var(--gold)'}`, width: '90vw', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: formType === 'promotion' ? 'var(--red)' : 'var(--gold)' }}>
              {editH ? 'Editar' : 'Nova'} {formType === 'promotion' ? 'Promoção' : 'Coleção'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Título *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={formType === 'promotion' ? 'Ex: Sale de Orgulho' : 'Ex: Coleção Raça'} />
              </div>

              {formType === 'promotion' && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <div>
                      <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Preço original</label>
                      <input style={inputStyle} value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="R$ 89,90" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Preço promocional</label>
                      <input style={inputStyle} value={form.promo_price} onChange={e => setForm(f => ({ ...f, promo_price: e.target.value }))} placeholder="R$ 59,90" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Válido até (some automaticamente)</label>
                    <input style={inputStyle} type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Link do produto</label>
                    <input style={inputStyle} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://umapenca.com/obicha/..." />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Posição (ordem no carrossel)</label>
                <input style={inputStyle} type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value) || 0 }))} />
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span className="text-sm opacity-70">Exibir no carrossel</span>
              </label>

              {editH && (
                <p className="text-xs opacity-40">Após salvar, clique em "Imagens" para fazer o upload das fotos.</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,.2)', color: 'rgba(242,235,217,.5)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bebas tracking-widest" style={{ background: formType === 'promotion' ? 'var(--red)' : 'var(--gold)', color: 'var(--navy)' }}>
                {saving ? 'Salvando...' : editH ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
