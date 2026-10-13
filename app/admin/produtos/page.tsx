'use client'

import { useState, useEffect, useRef } from 'react'
import {supplier} from '@/lib/storefront/catalog'
import { pickRepresentativeVariant } from '@/lib/category-variant-map'

type Product = {
  id: number; name: string; category: string; price: string; link: string
  image_url: string | null; description: string | null; featured: boolean
  collection_name: string | null; supplier: string | null
  updated_at?: string
  manual_variants?: any
}
type Category = { id: number; value: string; label: string; active: boolean }
type Collection = { id: number; name: string; slug: string }

const SUPPLIER_LABELS: Record<string, string> = {
  'reserva-ink-dtg': 'Reserva INK — DTG',
  'uma-penca-dtf': 'Uma Penca — DTF',
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,168,67,0.3)',
  color: 'var(--creme)', width: '100%', padding: '0.7rem 1rem',
  outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
}

function parseVariants(mv: any): {type: string; price: string; link: string; image_url?: string; active?: boolean; available?: boolean}[] {
  if (typeof mv === 'string') { try { mv = JSON.parse(mv) } catch { return [] } }
  return Array.isArray(mv) ? mv : []
}

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', category: 'camisetas', price: 'R$ ', link: 'https://umapenca.com/obicha/', image_url: '', description: '', featured: false, collection_name: '', manual_variants: [] as {type: string; price: string; link: string; image_url?: string; active?: boolean; available?: boolean}[] })
  const [selectedCollections, setSelectedCollections] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [syncing,setSyncing]=useState(false)
  const [notice,setNotice]=useState('')
  async function syncReserva(){
   setSyncing(true);setNotice('');
   try{const response=await fetch('/api/sync-feed',{method:'POST'});const data=await response.json();if(!response.ok)throw new Error(data.error);setNotice(`${data.updated} estampas conferidas. ${data.unavailable} opções indisponíveis. Uma Penca preservada.`);await load()}catch(error){setNotice(error instanceof Error?error.message:'Falha na sincronização.')}finally{setSyncing(false)}
  }
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const [prodRes, catRes, colRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories?all=true'),
      fetch('/api/collections'),
    ])
    setProducts(await prodRes.json())
    const syncState=await fetch('/api/sync-feed').then(r=>r.ok?r.json():null).catch(()=>null)
    if(syncState?.error)setNotice('Última conferência da Reserva: '+syncState.error)
    else if(syncState?.succeeded_at)setNotice('Reserva conferida em '+new Date(syncState.succeeded_at).toLocaleString('pt-BR'))
    setCategories(await catRes.json())
    setCollections(await colRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function openAdd() {
    setEditProduct(null)
    setForm({ name: '', category: categories[0]?.value || 'camisetas', price: 'R$ ', link: 'https://umapenca.com/obicha/', image_url: '', description: '', featured: false, collection_name: '', manual_variants: [] })
    setSelectedCollections([])
    setImagePreview(null)
    setShowForm(true)
  }

  async function openEdit(p: Product) {
    // busca a lista atualizada antes de editar, pra nunca sobrescrever com dado desatualizado da tela
    const freshRes = await fetch('/api/products')
    const freshProducts: Product[] = await freshRes.json()
    setProducts(freshProducts)
    const fresh = freshProducts.find(x => x.id === p.id) || p

    setEditProduct(fresh)
    setForm({ name: fresh.name, category: fresh.category, price: fresh.price, link: fresh.link, image_url: fresh.image_url || '', description: fresh.description || '', featured: fresh.featured, collection_name: fresh.collection_name || '', manual_variants: parseVariants(fresh.manual_variants) })
    setImagePreview(fresh.image_url)
    const res = await fetch(`/api/collections?product_id=${fresh.id}`)
    const data = await res.json()
    setSelectedCollections(data.map((c: any) => c.collection_id))
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

  function toggleCollection(id: number) {
    setSelectedCollections(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleSave() {
    setSaving(true)
    const method = editProduct ? 'PATCH' : 'POST'
    // quando há variantes, preço/link do produto viram apenas fallback — usa a primeira variante como referência
    const repVariant = pickRepresentativeVariant(form.category, form.manual_variants)
    const derived = repVariant
      ? { price: repVariant.price || form.price, link: repVariant.link || form.link }
      : { price: form.price, link: form.link }
    const payload = { ...form, ...derived }
    const body = editProduct ? { id: editProduct.id, expected_updated_at:editProduct.updated_at, ...payload } : payload
    const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const product = await res.json()
    if(!res.ok){setNotice(product.error||'Não foi possível salvar.');setSaving(false);return}
    const productId = editProduct ? editProduct.id : product.id
    await fetch('/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: productId, collection_ids: selectedCollections }) })
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este produto?')) return
    await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await load()
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Produtos</h1>
          <p className="opacity-50 text-sm mt-1">{products.length} estampas cadastradas · Reserva: preços e disponibilidade conferidos ao acessar a vitrine, no máximo uma vez por hora. Você também pode atualizar agora.</p>
        </div>
        <button disabled={syncing} onClick={syncReserva} className="px-4 py-3 border">{syncing?'Conferindo Reserva…':'Atualizar preços e disponibilidade da Reserva'}</button>
        <button onClick={openAdd} className="px-6 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Adicionar Produto
        </button>
      </div>

      {notice&&<p role="status" className="mb-4">{notice}</p>}
      {loading ? <p className="opacity-50">Carregando...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="border rounded overflow-hidden" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="aspect-square bg-white/5 relative">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl">👕</div>
                }
                <span className="absolute top-2 left-2 text-xs px-2 py-1 font-bebas tracking-widest" style={{ background: 'var(--navy)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,0.3)' }}>
                  {categories.find(c => c.value === p.category)?.label || p.category}
                </span>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <p className="text-xs opacity-50 mt-1">{p.price}</p>
                {p.supplier && <p className="text-xs mt-1" style={{ color: 'rgba(212,168,67,.5)' }}>{SUPPLIER_LABELS[p.supplier] || p.supplier}</p>}
                {parseVariants(p.manual_variants).length > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                    {parseVariants(p.manual_variants).length} variante{parseVariants(p.manual_variants).length !== 1 ? 's' : ''}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 py-1.5 text-xs font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,0.15)', color: 'var(--gold)' }}>Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 py-1.5 text-xs font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,0.15)', color: 'var(--red)' }}>Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--navy)', border: '1px solid var(--gold)', width: '90vw', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
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
                  {categories.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--navy)' }}>{c.label}{!c.active ? ' (inativa)' : ''}</option>)}
                </select>
              </div>

              {/* Preço e Link só aparecem quando o produto ainda não tem variantes cadastradas (ex: canecas, ecobags, itens sem modelo) */}
              {form.manual_variants.length === 0 && (
                <>
                  <div>
                    <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Preço</label>
                    <input style={inputStyle} placeholder="R$ 89,90" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Link da loja</label>
                    <input style={inputStyle} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Descrição (para SEO)</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Descreva o produto" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Imagem</label>
                <div style={{ width:'100%', aspectRatio:1, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px dashed rgba(212,168,67,0.3)', overflow:'hidden' }} onClick={() => fileRef.current?.click()}>
                  {imagePreview ? <img src={imagePreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ opacity:.3, fontSize:'.85rem' }}>Clique para selecionar imagem</span>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-3">Coleções</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                  {collections.map(c => (
                    <label key={c.id} style={{ display:'flex', alignItems:'center', gap:'.6rem', cursor:'pointer', padding:'.5rem .8rem', border:'1px solid', borderColor: selectedCollections.includes(c.id) ? 'var(--gold)' : 'rgba(212,168,67,.2)', background: selectedCollections.includes(c.id) ? 'rgba(212,168,67,.1)' : 'transparent', borderRadius:2, transition:'all .2s' }}>
                      <input type="checkbox" checked={selectedCollections.includes(c.id)} onChange={() => toggleCollection(c.id)} style={{ accentColor:'var(--gold)' }} />
                      <span style={{ fontSize:'.85rem', color: selectedCollections.includes(c.id) ? 'var(--gold)' : 'rgba(242,235,217,.6)' }}>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Variantes / Tipos disponíveis</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem', marginBottom:'.8rem' }}>
                  {['Camiseta','Regata','Cropped','Cropped Moletom','Camiseta Oversized','Camiseta Algodão Peruano','Camiseta Infantil','Hoodie Moletom','Suéter Moletom','Algodão','Dry Fit','Modal Tech','Estonada','Caneca','Ecobag','Kit de Bottons','Boné'].map(type => {
                    const already = false
                    return (
                      <button key={type} type="button" disabled={already}
                        onClick={() => setForm(f => ({...f, manual_variants: [...f.manual_variants, {type, price: '', link:''}]}))}
                        style={{ fontSize:'.75rem', padding:'.35rem .7rem', borderRadius:2, border:'1px solid', borderColor: already ? 'rgba(212,168,67,.15)' : 'rgba(212,168,67,.4)', background: already ? 'rgba(212,168,67,.05)' : 'transparent', color: already ? 'rgba(242,235,217,.25)' : 'var(--creme)', cursor: already ? 'default' : 'pointer' }}>
                        {already ? '✓ ' : '+ '}{type}
                      </button>
                    )
                  })}
                </div>
                {form.manual_variants.map((v, i) => (
                  <div key={i} style={{ display:'flex', gap:'.5rem', marginBottom:'.5rem', alignItems:'center' }}>
                    <label style={{ flexShrink:0, cursor:'pointer', width:34, height:34, borderRadius:4, overflow:'hidden', border:'1px solid rgba(212,168,67,0.3)', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.05)' }} title="Foto específica dessa variante (opcional)">
                      {v.image_url
                        ? <img src={v.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <span style={{ fontSize:'1rem', opacity:.4 }}>📷</span>
                      }
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        const res = await fetch('/api/upload', { method: 'POST', body: fd })
                        const { url } = await res.json()
                        const mv = [...form.manual_variants]
                        mv[i] = { ...mv[i], image_url: url }
                        setForm(f => ({ ...f, manual_variants: mv }))
                      }} />
                    </label>
                    <span style={{ fontSize:'.8rem', color:'var(--gold)', minWidth:140, flexShrink:0 }}>{v.type}<small style={{display:'block'}}>{supplier(v.link)==='reserva'?'Reserva Ink':supplier(v.link)==='penca'?'Uma Penca':'Defina um link válido'}</small><small style={{display:'block'}}>{v.available===false?'Indisponível na última sincronização':'Disponibilidade a confirmar na loja'}</small></span>
                    <label><input type="checkbox" checked={v.active!==false} onChange={e=>{const mv=[...form.manual_variants];mv[i]={...mv[i],active:e.target.checked};setForm(f=>({...f,manual_variants:mv}))}}/> Ativo</label>
                    <input style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(212,168,67,0.3)', color:'var(--creme)', padding:'.5rem .8rem', outline:'none', fontSize:'.85rem', flex:1, minWidth:0 }} placeholder="Preço" value={v.price} onChange={e => { const mv = [...form.manual_variants]; mv[i] = {...mv[i], price: e.target.value}; setForm(f => ({...f, manual_variants: mv})) }} />
                    <input style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(212,168,67,0.3)', color:'var(--creme)', padding:'.5rem .8rem', outline:'none', fontSize:'.85rem', flex:2, minWidth:0 }} placeholder="Link do produto" value={v.link} onChange={e => { const mv = [...form.manual_variants]; mv[i] = {...mv[i], link: e.target.value}; setForm(f => ({...f, manual_variants: mv})) }} />
                    {v.image_url && (
                      <button type="button" onClick={() => { const mv = [...form.manual_variants]; mv[i] = {...mv[i], image_url: ''}; setForm(f => ({...f, manual_variants: mv})) }} style={{ color:'var(--creme)', opacity:.4, flexShrink:0, fontSize:'.75rem' }} title="Remover foto específica">↺</button>
                    )}
                    <button type="button" onClick={() => setForm(f => ({...f, manual_variants: f.manual_variants.filter((_,j) => j !== i),...(f.manual_variants.length===1?{link:'',price:''}:{})}))} style={{ color:'var(--red)', flexShrink:0 }}>✕</button>
                  </div>
                ))}
                {form.manual_variants.length === 0 && <p style={{ fontSize:'.78rem', opacity:.4 }}>Opcional — clique nos tipos acima se essa estampa existir em mais de um modelo.</p>}
                {form.manual_variants.length > 0 && <p style={{ fontSize:'.78rem', opacity:.4, marginTop:'.5rem' }}>Preço e link do produto agora são definidos por cada variante acima — não há mais um único preço/link geral. A foto (📷) é opcional: sem ela, usa a foto principal da estampa.</p>}
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <span className="text-sm opacity-70">⭐ Destacar no carrossel da página</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,0.2)', color: 'rgba(242,235,217,0.5)' }}>Cancelar</button>
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
