'use client'

import { useState, useEffect, useRef } from 'react'
import './catalog-admin.css'
import {filterCatalogProducts,productOptions,visibilityStatus,statusLabels,modelFamilies,modelFamily,type VisibilityAction} from '@/lib/storefront/visibility'
import {supplier} from '@/lib/storefront/catalog'
import { pickRepresentativeVariant } from '@/lib/category-variant-map'

type Product = {
  id: number; name: string; category: string; price: string; link: string
  image_url: string | null; description: string | null; featured: boolean
  collection_name: string | null; supplier: string | null
  hidden?:boolean
  collections?:{name:string}[]
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

function parseVariants(mv: any): {type: string; price: string; link: string; image_url?: string; active?: boolean; available?: boolean; pending_until?:string; availability_source?:'manual'|'reserva'}[] {
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
  const [form, setForm] = useState({ name: '', category: 'camisetas', price: 'R$ ', link: '', image_url: '', description: '', featured: false, hidden:false, collection_name: '', manual_variants: [] as {type: string; price: string; link: string; image_url?: string; active?: boolean; available?: boolean; pending_until?:string; availability_source?:'manual'|'reserva'}[] })
  const [selectedCollections, setSelectedCollections] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [syncing,setSyncing]=useState(false)
  const [importLink,setImportLink]=useState('')
  const [importing,setImporting]=useState(false)
  const [candidates,setCandidates]=useState<{name:string;link:string;models:string[]}[]>([])
  async function importReserva(link?:string){
   setImporting(true);setNotice('');
   try{const r=await fetch('/api/products/import-reserva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({link})});const data=await r.json();if(!r.ok)throw new Error(data.error);
    if(!link){setCandidates(data.candidates);setNotice(`${data.candidates.length} estampas ainda não cadastradas. Escolha uma para revisar.`);return}
    if(data.existingId){const existing=products.find(p=>p.id===data.existingId);if(existing)await openEdit(existing);setNotice('Essa estampa já está cadastrada. Confira os modelos antes de salvar.');setForm(f=>({...f,manual_variants:[...parseVariants(existing?.manual_variants).filter(v=>supplier(v.link)!=='reserva'||!data.product.manual_variants.some((x:any)=>x.type===v.type)),...data.product.manual_variants.map((v:any)=>({...v,active:parseVariants(existing?.manual_variants).find(x=>supplier(x.link)==='reserva'&&x.type===v.type)?.active!==false}))]}));}
    else{await openAdd();setForm(f=>({...f,...data.product}));setImagePreview(data.product.image_url);setNotice('Revise nome, coleção e modelos e salve para publicar. Apenas modelos confirmados na loja foram trazidos.');}
   }catch(error){setNotice(error instanceof Error?error.message:'Falha na importação.')}finally{setImporting(false)}
  }
  const [notice,setNotice]=useState('')
  const [syncState,setSyncState]=useState<{succeeded_at?:string;attempted_at?:string;error?:string}|null>(null)
  const [filters,setFilters]=useState({search:'',family:'all',store:'all',collection:'all',status:'all'})
  const [selected,setSelected]=useState<number[]>([])
  const [actionFamily,setActionFamily]=useState('sweatshirt')
  const [pending,setPending]=useState<(VisibilityAction&{ids:number[]})|null>(null)
  const [acting,setActing]=useState(false)
  const filtered=filterCatalogProducts(products,filters)
  function changeFilter(key:keyof typeof filters,value:string){setFilters(f=>({...f,[key]:value}));setSelected([]);if(key==='family'&&value!=='all')setActionFamily(value)}
  function choose(id:number){setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])}
  async function applyPending(){
   if(!pending)return;setActing(true);setNotice('');
   try{const response=await fetch('/api/products/visibility',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending)});const data=await response.json();if(!response.ok)throw new Error(data.error);await load();setSelected([]);setPending(null);setNotice(`${data.count} ${data.count===1?'estampa atualizada':'estampas atualizadas'}. Alteração aplicada à vitrine.`)}catch(error){setNotice(error instanceof Error?error.message:'Não foi possível alterar a seleção.')}finally{setActing(false)}
  }

  async function syncReserva(){
   setSyncing(true);setNotice('');
   try{const response=await fetch('/api/sync-feed',{method:'POST'});const data=await response.json();if(!response.ok)throw new Error(data.error);setNotice(`${data.updated} estampas conferidas. ${data.unavailable} opções indisponíveis. Uma Penca preservada.`);await load()}catch(error){setNotice(error instanceof Error?error.message:'Falha na sincronização.')}finally{setSyncing(false)}
  }
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(()=>{
   if(!pending&&!showForm)return;
   const before=document.activeElement as HTMLElement|null;
   const modal=document.querySelector<HTMLElement>('[data-catalog-modal]');
   const controls=()=>Array.from(modal?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')||[]).filter(el=>el.offsetParent!==null);
   controls()[0]?.focus();
   function onKey(e:KeyboardEvent){
    if(e.key==='Escape'&&!acting&&!saving){setPending(null);setShowForm(false)}
    if(e.key==='Tab'){const items=controls(),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
   }
   document.addEventListener('keydown',onKey);return()=>{document.removeEventListener('keydown',onKey);before?.focus()};
  },[!!pending,showForm,acting,saving])


  async function load() {
    const [prodRes, catRes, colRes] = await Promise.all([
      fetch('/api/products?withCollections=1'),
      fetch('/api/categories?all=true'),
      fetch('/api/collections'),
    ])
    if(!prodRes.ok||!catRes.ok||!colRes.ok)throw new Error('Não foi possível carregar o catálogo. Recarregue o painel.')
    setProducts(await prodRes.json())
    setSelected([])
    const syncState=await fetch('/api/sync-feed').then(r=>r.ok?r.json():null).catch(()=>null)
    setSyncState(syncState)
    setCategories(await catRes.json())
    setCollections(await colRes.json())
    setLoading(false)
  }

  useEffect(() => { load().catch(error=>{setNotice(error.message);setLoading(false)}) }, [])

  async function openAdd() {
    setEditProduct(null)
    setForm({ name: '', category: categories[0]?.value || 'camisetas', price: 'R$ ', link: '', image_url: '', description: '', featured: false, hidden:false, collection_name: '', manual_variants: [] })
    setSelectedCollections([])
    setImagePreview(null)
    setShowForm(true)
  }

  async function openEdit(p: Product) {
    setNotice('')
    // busca a lista atualizada antes de editar, pra nunca sobrescrever com dado desatualizado da tela
    const freshRes = await fetch('/api/products?withCollections=1')
    const freshProducts: Product[] = await freshRes.json()
    setProducts(freshProducts)
    const fresh = freshProducts.find(x => x.id === p.id) || p

    setEditProduct(fresh)
    setForm({ name: fresh.name, category: fresh.category, price: fresh.price, link: fresh.link, image_url: fresh.image_url || '', description: fresh.description || '', featured: fresh.featured, hidden:fresh.hidden===true, collection_name: fresh.collection_name || '', manual_variants: parseVariants(fresh.manual_variants) })
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
    if(!form.name.trim()){setNotice('Dê um nome à estampa antes de salvar.');return}
    if(!form.hidden&&!supplier(form.link)&&!form.manual_variants.some(v=>supplier(v.link))){setNotice('Informe um link válido da Reserva Ink ou Uma Penca, ou marque a estampa como oculta para terminar depois.');return}
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
    if (!confirm('Excluir permanentemente esta estampa e todos os modelos? Para retirar da vitrine sem perder o cadastro, use Ocultar.')) return false
    const response=await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if(!response.ok){setNotice('Não foi possível excluir a estampa.');return false}
    await load();return true
  }

  return (
    <div className="catalog-admin">
      <header className="catalog-admin-heading"><div><p className="catalog-eyebrow">Ô BICHA! / SUA VITRINE</p><h1>Seu catálogo.<br/><em>Do seu jeito.</em></h1><p>Estampas, modelos e visibilidade em um só lugar.</p></div><div className="catalog-heading-actions"><a href="/" target="_blank" rel="noopener noreferrer">Ver vitrine ↗</a><button className="catalog-button primary" onClick={openAdd}>+ Nova estampa</button></div></header>
      <div className="catalog-stat-grid">{['visible','hidden','paused','unavailable'].map(status=><button key={status} aria-pressed={filters.status===status} onClick={()=>changeFilter('status',filters.status===status?'all':status)}><strong>{products.filter(p=>visibilityStatus(p)===status).length}</strong><span>{statusLabels[status]}</span></button>)}</div>
      <section className="catalog-sync"><div><strong>Importar da Reserva Ink</strong><p>O link traz todos os modelos encontrados no arquivo da Reserva. Se a estampa ainda não está nesse arquivo, traz somente o modelo do link. Para cadastrar todos agora, use Nova estampa e controle manual.</p><label>Link do produto<input className="catalog-input" value={importLink} onChange={e=>setImportLink(e.target.value)} placeholder="https://lojareservaink.obicha.com.br/…" /></label><button className="catalog-button" disabled={importing||!importLink.trim()} onClick={()=>importReserva(importLink.trim())}>Importar por link</button><button className="catalog-button" disabled={importing} onClick={()=>importReserva()}>Buscar estampas novas</button>{candidates.map(c=><p key={c.link}><button className="catalog-button" disabled={importing} onClick={()=>importReserva(c.link)}>{c.name}</button> <small>{c.models.join(', ')}</small></p>)}</div></section>
      <section className="catalog-sync"><div><strong>Conferência da Reserva Ink</strong><p>{syncState?.succeeded_at?'Última conferência concluída: '+new Date(syncState.succeeded_at).toLocaleString('pt-BR'):'Nenhuma conferência concluída registrada.'}</p>{syncState?.error&&<p className="catalog-error">{syncState.error} O último catálogo foi preservado.</p>}<small>Automática ao acessar a vitrine, no máximo uma vez por hora. Respeita o que você ocultou. Atualiza cadastros existentes; use a importação acima para estampas novas.</small></div><button className="catalog-button" disabled={syncing||acting} onClick={syncReserva}>{syncing?'Conferindo…':'Conferir agora'}</button></section>
      {notice&&<p role="status" className="catalog-notice">{notice}</p>}
      <section className="catalog-filters" aria-label="Filtrar catálogo"><label className="catalog-search">Buscar estampa<input type="search" placeholder="Nome ou coleção…" value={filters.search} onChange={e=>changeFilter('search',e.target.value)}/></label><label>Coleção<select value={filters.collection} onChange={e=>changeFilter('collection',e.target.value)}><option value="all">Todas</option>{[...new Set([...collections.map(c=>c.name),...products.flatMap(p=>p.collections?.map(c=>c.name)||[p.collection_name||''])])].filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(c=><option key={c}>{c}</option>)}</select></label><label>Modelo<select value={filters.family} onChange={e=>changeFilter('family',e.target.value)}><option value="all">Todos</option>{Object.entries(modelFamilies).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label><label>Parceira<select value={filters.store} onChange={e=>changeFilter('store',e.target.value)}><option value="all">Todas</option><option value="reserva">Reserva Ink</option><option value="penca">Uma Penca</option></select></label><label>Situação<select value={filters.status} onChange={e=>changeFilter('status',e.target.value)}><option value="all">Todas</option>{Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></section>
      <div className="catalog-results"><label><input type="checkbox" disabled={!filtered.length||acting} checked={filtered.length>0&&selected.length===filtered.length} onChange={e=>setSelected(e.target.checked?filtered.map(p=>p.id):[])}/> Selecionar {filtered.length} resultados</label><span>{selected.length?`${selected.length} selecionadas`: `${filtered.length} de ${products.length} estampas`}</span><button onClick={()=>{setFilters({search:'',family:'all',store:'all',collection:'all',status:'all'});setSelected([])}}>Limpar filtros</button></div>
      {selected.length>0&&<section className="catalog-bulk" aria-label="Ações na seleção"><div><strong>{selected.length} estampas selecionadas</strong><p>Ocultar mantém o cadastro. Reexibir respeita a disponibilidade da loja.</p></div><div className="catalog-bulk-actions"><button className="catalog-button" onClick={()=>setPending({ids:selected,scope:'designs',visible:false})}>Ocultar estampas</button><button className="catalog-button" onClick={()=>setPending({ids:selected,scope:'designs',visible:true})}>Reexibir estampas</button><label>Modelo para a ação<select value={actionFamily} onChange={e=>setActionFamily(e.target.value)}>{Object.entries(modelFamilies).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label><button className="catalog-button primary" onClick={()=>setPending({ids:selected,scope:'models',family:actionFamily,store:filters.store,visible:false})}>Ocultar modelos</button><button className="catalog-button" onClick={()=>setPending({ids:selected,scope:'models',family:actionFamily,store:filters.store,visible:true})}>Reexibir modelos</button></div></section>}
      {loading?<p role="status">Carregando catálogo…</p>:!filtered.length?<div className="catalog-empty"><h2>Nenhuma estampa nesse filtro.</h2><p>Experimente outro nome ou limpe os filtros.</p></div>:<div className="catalog-list">{filtered.map(p=>{const options=productOptions(p);const live=options.filter(v=>v.active!==false&&v.available!==false&&supplier(v.link));const status=visibilityStatus(p);return <article key={p.id} className={'catalog-row '+(selected.includes(p.id)?'selected':'')}><label className="catalog-row-select"><input type="checkbox" aria-label={'Selecionar '+p.name} checked={selected.includes(p.id)} onChange={()=>choose(p.id)}/></label><img className="catalog-thumb" src={p.image_url||'/Logo_-_O_Bicha.png'} alt="" width={80} height={80} loading="lazy"/><div className="catalog-row-copy"><h2>{p.name}</h2><p>{[...new Set([...(p.collections?.map(c=>c.name)||[]),p.collection_name||''])].filter(Boolean).join(' · ')||'Sem coleção'}</p><div className="catalog-row-meta"><span className={'catalog-status '+status}>{statusLabels[status]}</span><span>{live.length} de {options.length} modelos disponíveis e ativos</span></div><details><summary>Conferir modelos e lojas</summary><ul>{options.map((v,i)=><li key={v.link+i}><span>{v.type} · {supplier(v.link)==='reserva'?'Reserva Ink':supplier(v.link)==='penca'?'Uma Penca':'Link inválido'}</span><small>{v.active===false?'Oculto por você':v.available===false?'Indisponível na loja':'Ativo'} · {v.price||'Preço não informado'}</small></li>)}</ul></details></div><div className="catalog-row-actions"><button className="catalog-button" onClick={()=>openEdit(p)}>Editar</button><button className="catalog-button" onClick={()=>setPending({ids:[p.id],scope:'designs',visible:!!p.hidden})}>{p.hidden?'Reexibir':'Ocultar estampa'}</button><>{status==='visible'?<a href={'/?product='+p.id+'#vitrine'} target="_blank" rel="noopener noreferrer">Ver na vitrine ↗</a>:<small>Fora da vitrine</small>}</></div></article>})}</div>}
      {pending&&<div className="catalog-confirm-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="visibility-title" className="catalog-confirm" data-catalog-modal><h2 id="visibility-title">{pending.visible?'Reexibir':'Ocultar'} {pending.scope==='designs'?'estampas':'modelos'}?</h2><p>{pending.scope==='designs'?`${pending.ids.length} estampas inteiras serão ${pending.visible?'reexibidas, se tiverem modelos ativos e disponíveis':'ocultadas da vitrine'}.`:`${modelFamilies[pending.family!]}: ${pending.ids.reduce((n,id)=>n+productOptions(products.find(p=>p.id===id)!).filter(v=>modelFamily(v.type)===pending.family&&(pending.store==='all'||supplier(v.link)===pending.store)).length,0)} modelos em ${pending.ids.length} estampas. Parceira: ${pending.store==='reserva'?'Reserva Ink':pending.store==='penca'?'Uma Penca':'todas'}. Os outros modelos permanecem como estão.`}</p><p>O cadastro será preservado. A sincronização não desfaz sua escolha.</p><div><button className="catalog-button" disabled={acting} onClick={()=>setPending(null)}>Cancelar</button><button className="catalog-button primary" autoFocus disabled={acting} onClick={applyPending}>{acting?'Aplicando…':'Confirmar'}</button></div>{notice&&<p role="alert">{notice}</p>}</section></div>}
      {showForm && (
        <div className="catalog-editor-backdrop fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div role="dialog" aria-modal="true" aria-label={editProduct?'Editar estampa':'Nova estampa'} data-catalog-modal style={{ background: 'var(--navy)', border: '1px solid var(--gold)', width: '90vw', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
              {editProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="space-y-4"><label className="catalog-edit-visibility"><input type="checkbox" checked={form.hidden} onChange={e=>setForm(f=>({...f,hidden:e.target.checked}))}/> Ocultar estampa inteira da vitrine</label>
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
                      <span style={{ fontSize:'.85rem', color: selectedCollections.includes(c.id) ? 'var(--gold)' : '#1a2744' }}>{c.name}</span>
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
                        onClick={() => setForm(f => ({...f, manual_variants: [...f.manual_variants, {type, price: '', link:'',availability_source:'manual'}]}))}
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
                    <span style={{ fontSize:'.8rem', color:'var(--gold)', minWidth:140, flexShrink:0 }}>{v.type}<small style={{display:'block'}}>{supplier(v.link)==='reserva'?'Reserva Ink':supplier(v.link)==='penca'?'Uma Penca':'Defina um link válido'}</small><small style={{display:'block'}}>{v.availability_source==='manual'?'Disponibilidade controlada por você':v.available===false?'Indisponível na última sincronização':'Disponibilidade consultada na Reserva'}</small></span>
                    <label title="No modo manual, a sincronização não altera preço, link nem disponibilidade deste modelo."><input type="checkbox" checked={v.availability_source==='manual'} onChange={e=>{const mv=[...form.manual_variants];mv[i]={...mv[i],availability_source:e.target.checked?'manual':'reserva',available:e.target.checked?true:mv[i].available};setForm(f=>({...f,manual_variants:mv}))}}/> Controle manual</label>
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
                {form.manual_variants.length > 0 && <p style={{ fontSize:'.78rem', opacity:.4, marginTop:'.5rem' }}>No controle manual, você mantém preço, link e disponibilidade; a sincronização não altera esse modelo. Nos demais modelos, a Reserva atualiza esses dados. Preço e link do produto são definidos por cada variante acima — não há mais um único preço/link geral. A foto (📷) é opcional: sem ela, usa a foto principal da estampa.</p>}
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <span className="text-sm opacity-70">⭐ Destacar no carrossel da página</span>
              </label>
            </div>

            {notice&&<p role="alert" className="catalog-notice">{notice}</p>}{editProduct&&<div className="catalog-danger"><p>Para tirar da vitrine, use ocultar. A exclusão é definitiva.</p><button onClick={async()=>{if(await handleDelete(editProduct.id))setShowForm(false)}}>Excluir permanentemente esta estampa</button></div>}
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
