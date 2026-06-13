'use client'

import { useState, useEffect, useRef } from 'react'

type Product = {
  id: number
  name: string
  category: string
  price: string
  link: string
  image_url: string | null
  description: string | null
  featured: boolean
  collection_name: string | null
}

const categories = [
  { value: 'camisetas', label: 'Camiseta Algodão' },
  { value: 'estonada', label: 'Camiseta Estonada' },
  { value: 'dryfit', label: 'Dry Fit' },
  { value: 'modal', label: 'Modal Tech' },
  { value: 'canecas', label: 'Caneca' },
  { value: 'ecobags', label: 'Ecobag' },
  { value: 'bottoms', label: 'Bottom' },
]

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', category: 'camisetas', price: 'R$ ', link: 'https://umapenca.com/obicha/', image_url: '', description: '', featured: false, collection_name: '' })
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch('/api/products')
    setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditProduct(null)
    setForm({ name: '', category: 'camisetas', price: 'R$ ', link: 'https://umapenca.com/obicha/', image_url: '', description: '', featured: false, collection_name: '' })
    setImagePreview(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setForm({ name: p.name, category: p.category, price: p.price, link: p.link, image_url: p.image_url || '', description: p.description || '', featured: p.featured, collection_name: p.collection_name || '' })
    setImagePreview(p.image_url)
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
    setSaving(true)
    const method = editProduct ? 'PATCH' : 'POST'
    const body = editProduct ? { id: editProduct.id, ...form } : form
    await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este produto?')) return
    await fetch('/api/products', {
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
    fontFamily: 'inherit',
    fontSize: '0.9rem',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Produtos</h1>
          <p className="opacity-50 text-sm mt-1">{products.length} produtos cadastrados</p>
        </div>
        <button onClick={openAdd} className="px-6 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Adicionar Produto
        </button>
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="border rounded overflow-hidden" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="aspect-square bg-white/5 relative">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl">👕</div>
                }
                <span className="absolute top-2 left-2 text-xs px-2 py-1 font-bebas tracking-widest" style={{ background: 'var(--navy)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,0.3)' }}>
                  {categories.find(c => c.value === p.category)?.label}
                </span>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <p className="text-xs opacity-50 mt-1">{p.price}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 py-1.5 text-xs font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,0.15)', color: 'var(--gold)' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 py-1.5 text-xs font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,0.15)', color: 'var(--red)' }}>
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form — responsivo ao zoom do browser */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div style={{
            background: 'var(--navy)',
            border: '1px solid var(--gold)',
            width: '90vw',
            maxWidth: 480,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
          }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
              {editProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Nome</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Categoria</label>
                <select style={{ ...inputStyle }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {categories.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--navy)' }}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Preço</label>
                <input style={inputStyle} placeholder="R$ 89,90" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Link da loja</label>
                <input style={inputStyle} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Descrição (para SEO)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Descreva o produto — essa descrição aparece no Google"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Imagem</label>
                <div
                  style={{ width:'100%', aspectRatio:1, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px dashed rgba(212,168,67,0.3)', overflow:'hidden' }}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ opacity:.3, fontSize:'.85rem' }}>Clique para selecionar imagem</span>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Coleção (ex: Raça, São Jorge)</label>
                <input style={inputStyle} placeholder="Nome da coleção — opcional" value={form.collection_name} onChange={e => setForm(f => ({ ...f, collection_name: e.target.value }))} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <span className="text-sm opacity-70">⭐ Destacar no carrossel da página</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,0.2)', color: 'rgba(242,235,217,0.5)' }}>
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
