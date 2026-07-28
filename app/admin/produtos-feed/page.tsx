'use client'

import { useState, useEffect, useRef } from 'react'

type Variant = { id: number; variant_type: string; price: string; link: string }
type FeedProduct = {
  id: number; source: string; name: string; description: string
  image_url: string | null; scene_image_url: string | null
  active: boolean; variants: Variant[]
}

const sourceLabel = (s: string) => s === 'reserva-ink' ? '🔵 Reserva INK' : '🟡 Uma Penca'

export default function AdminProdutosFeed() {
  const [products, setProducts] = useState<FeedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editProduct, setEditProduct] = useState<FeedProduct | null>(null)
  const [uploadingScene, setUploadingScene] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const LIMIT = 24

  async function load(p = page, s = search, src = source) {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
    if (s) params.set('search', s)
    if (src) params.set('source', src)
    const res = await fetch(`/api/feed-products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    const res = await fetch('/api/sync-feed', { method: 'POST' })
    const data = await res.json()
    if (data.ok) {
      setSyncResult(`✓ Sincronizado! Reserva INK: ${data.reserva} estampas · Uma Penca: ${data.umapenca} estampas`)
      await load()
    } else {
      setSyncResult(`✗ Erro: ${data.error}`)
    }
    setSyncing(false)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    await load(1, search, source)
  }

  async function handleToggleActive(p: FeedProduct) {
    await fetch('/api/feed-products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, active: !p.active })
    })
    await load()
  }

  async function handleSceneUpload(file: File) {
    if (!editProduct) return
    setUploadingScene(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    await fetch('/api/feed-products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editProduct.id, scene_image_url: url })
    })
    setEditProduct({ ...editProduct, scene_image_url: url })
    setUploadingScene(false)
    await load()
  }

  async function handleRemoveScene() {
    if (!editProduct) return
    await fetch('/api/feed-products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editProduct.id, scene_image_url: null })
    })
    setEditProduct({ ...editProduct, scene_image_url: null })
    await load()
  }

  const totalPages = Math.ceil(total / LIMIT)

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,168,67,0.3)',
    color: 'var(--creme)', padding: '0.6rem 1rem', outline: 'none',
    fontFamily: 'inherit', fontSize: '0.9rem',
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Produtos das Lojas</h1>
          <p className="opacity-50 text-sm mt-1">{total} estampas · Reserva INK + Uma Penca</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="px-6 py-3 font-bebas tracking-widest"
          style={{ background: syncing ? 'rgba(212,168,67,.4)' : 'var(--gold)', color: 'var(--navy)' }}>
          {syncing ? '⟳ Sincronizando...' : '⟳ Sincronizar Feeds'}
        </button>
      </div>

      {syncResult && (
        <div className="mb-6 px-4 py-3 text-sm" style={{ background: syncResult.startsWith('✓') ? 'rgba(74,222,128,.1)' : 'rgba(192,40,28,.1)', border: `1px solid ${syncResult.startsWith('✓') ? 'rgba(74,222,128,.3)' : 'rgba(192,40,28,.3)'}`, color: syncResult.startsWith('✓') ? '#4ade80' : 'var(--red)' }}>
          {syncResult}
        </div>
      )}

      {/* Filtros */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-wrap">
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} placeholder="Buscar estampa..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...inputStyle }} value={source} onChange={e => { setSource(e.target.value); setPage(1); load(1, search, e.target.value) }}>
          <option value="">Todas as lojas</option>
          <option value="reserva-ink">Reserva INK</option>
          <option value="uma-penca">Uma Penca</option>
        </select>
        <button type="submit" className="px-4 py-2 font-bebas tracking-widest text-sm" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,.3)' }}>Buscar</button>
      </form>

      {loading ? <p className="opacity-50">Carregando...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {products.map(p => (
              <div key={p.id} className="border rounded overflow-hidden" style={{ borderColor: p.active ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', opacity: p.active ? 1 : .4 }}>
                <div className="aspect-square bg-white/5 relative cursor-pointer" onClick={() => setEditProduct(p)}>
                  {p.scene_image_url
                    ? <img src={p.scene_image_url} alt={p.name} className="w-full h-full object-cover" />
                    : p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl">👕</div>
                  }
                  <span className="absolute top-2 left-2 text-xs px-1.5 py-0.5 font-bebas" style={{ background: 'rgba(15,26,46,.9)', color: p.source === 'reserva-ink' ? '#60a5fa' : '#facc15', fontSize: '.65rem' }}>
                    {p.source === 'reserva-ink' ? 'RESERVA' : 'UMA PENCA'}
                  </span>
                  {p.scene_image_url && (
                    <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5" style={{ background: 'rgba(74,222,128,.2)', color: '#4ade80', fontSize: '.65rem' }}>📸</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-xs truncate mb-1">{p.name}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(p.variants || []).map((v, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,168,67,.1)', color: 'var(--gold)', fontSize: '.65rem' }}>{v.variant_type}</span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditProduct(p)} className="flex-1 py-1 text-xs font-bebas" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)' }}>Editar</button>
                    <button onClick={() => handleToggleActive(p)} className="flex-1 py-1 text-xs font-bebas" style={{ background: p.active ? 'rgba(192,40,28,.15)' : 'rgba(74,222,128,.15)', color: p.active ? 'var(--red)' : '#4ade80' }}>
                      {p.active ? 'Ocultar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => { setPage(p => p - 1); load(page - 1, search, source) }} disabled={page === 1} className="px-3 py-1.5 text-sm font-bebas" style={{ background: 'rgba(212,168,67,.1)', color: 'var(--gold)', opacity: page === 1 ? .3 : 1 }}>← Anterior</button>
              <span className="px-3 py-1.5 text-sm opacity-50">{page} / {totalPages}</span>
              <button onClick={() => { setPage(p => p + 1); load(page + 1, search, source) }} disabled={page === totalPages} className="px-3 py-1.5 text-sm font-bebas" style={{ background: 'rgba(212,168,67,.1)', color: 'var(--gold)', opacity: page === totalPages ? .3 : 1 }}>Próxima →</button>
            </div>
          )}
        </>
      )}

      {/* Modal de edição */}
      {editProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--navy)', border: '1px solid var(--gold)', width: '90vw', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 className="font-playfair text-xl font-bold mb-1" style={{ color: 'var(--gold)' }}>{editProduct.name}</h2>
            <p className="text-xs opacity-40 mb-6">{sourceLabel(editProduct.source)}</p>

            {/* Foto de cena */}
            <div className="mb-6">
              <label className="block text-xs tracking-widest uppercase opacity-60 mb-3">Foto de Cena (modelo usando a peça)</label>
              <div className="flex gap-4">
                <div style={{ width: 140, height: 140, flexShrink: 0, cursor: 'pointer', border: '2px dashed rgba(212,168,67,.3)', overflow: 'hidden', position: 'relative' }} onClick={() => fileRef.current?.click()}>
                  {editProduct.scene_image_url
                    ? <img src={editProduct.scene_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : editProduct.image_url
                    ? <img src={editProduct.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .5 }} />
                    : <div className="w-full h-full flex items-center justify-center opacity-30 text-3xl">📸</div>
                  }
                  {uploadingScene && <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(26,39,68,.8)' }}><span className="text-xs opacity-70">Enviando...</span></div>}
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <button onClick={() => fileRef.current?.click()} disabled={uploadingScene} className="text-xs px-3 py-2 font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,.3)' }}>
                    {editProduct.scene_image_url ? 'Trocar foto' : 'Adicionar foto'}
                  </button>
                  {editProduct.scene_image_url && (
                    <button onClick={handleRemoveScene} className="text-xs px-3 py-2 font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,.15)', color: 'var(--red)', border: '1px solid rgba(192,40,28,.3)' }}>Remover</button>
                  )}
                  <p className="text-xs opacity-30">Clique na imagem ou no botão</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleSceneUpload(e.target.files[0])} />
            </div>

            {/* Variantes */}
            <div className="mb-6">
              <label className="block text-xs tracking-widest uppercase opacity-60 mb-3">Tipos disponíveis</label>
              <div className="space-y-2">
                {(editProduct.variants || []).map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.1)' }}>
                    <div>
                      <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{v.variant_type}</span>
                      <span className="text-xs opacity-50 ml-2">{v.price}</span>
                    </div>
                    <a href={v.link} target="_blank" className="text-xs px-2 py-1 font-bebas" style={{ color: 'var(--gold)', border: '1px solid rgba(212,168,67,.3)' }}>Ver ↗</a>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setEditProduct(null)} className="w-full py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,.2)', color: 'rgba(242,235,217,.5)' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
