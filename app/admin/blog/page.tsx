'use client'

import { useState, useEffect, useRef } from 'react'

type Post = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  published: boolean
  created_at: string
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', cover_image: '', published: false })
  const [saving, setSaving] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  async function load() {
    const res = await fetch('/api/blog')
    setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditPost(null)
    setForm({ title: '', excerpt: '', content: '', cover_image: '', published: false })
    setCoverPreview(null)
    setShowForm(true)
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = '' }, 100)
  }

  function openEdit(p: Post) {
    setEditPost(p)
    setForm({ title: p.title, excerpt: p.excerpt || '', content: p.content, cover_image: p.cover_image || '', published: p.published })
    setCoverPreview(p.cover_image)
    setShowForm(true)
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = p.content }, 100)
  }

  async function handleCoverUpload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setCoverPreview(url)
    setForm(f => ({ ...f, cover_image: url }))
  }

  function execFormat(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
  }

  async function handleSave() {
    if (!form.title.trim()) { alert('Título obrigatório!'); return }
    setSaving(true)
    const content = editorRef.current?.innerHTML || ''
    const method = editPost ? 'PATCH' : 'POST'
    const body = editPost
      ? { id: editPost.id, ...form, content }
      : { ...form, content }

    try {
      const res = await fetch('/api/blog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        alert('Erro ao salvar: ' + (data.error || 'Tente novamente'))
        setSaving(false)
        return
      }
      await load()
      setShowForm(false)
    } catch (err) {
      alert('Erro de conexão. Tente novamente.')
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este post?')) return
    await fetch('/api/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  async function togglePublish(post: Post) {
    await fetch('/api/blog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, published: !post.published }),
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

  const toolbarBtn = (label: string, action: () => void) => (
    <button
      key={label}
      type="button"
      onMouseDown={e => { e.preventDefault(); action() }}
      style={{ padding:'.3rem .7rem', background:'rgba(255,255,255,.08)', border:'1px solid rgba(212,168,67,.2)', color:'var(--creme)', cursor:'pointer', fontSize:'.8rem', fontFamily:'inherit', borderRadius:2, transition:'background .2s' }}
      onMouseEnter={e => (e.target as HTMLElement).style.background='rgba(212,168,67,.15)'}
      onMouseLeave={e => (e.target as HTMLElement).style.background='rgba(255,255,255,.08)'}
    >
      {label}
    </button>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Blog</h1>
          <p className="opacity-50 text-sm mt-1">{posts.length} posts</p>
        </div>
        <button onClick={openAdd} className="px-6 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Novo Post
        </button>
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : posts.length === 0 ? (
        <div className="border border-dashed rounded p-12 text-center opacity-30" style={{ borderColor: 'rgba(212,168,67,.3)' }}>
          <p className="text-4xl mb-3">✍️</p>
          <p>Nenhum post ainda. Que tal começar?</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 border rounded" style={{ borderColor: 'rgba(212,168,67,.2)', background: 'rgba(255,255,255,.02)' }}>
              {post.cover_image && (
                <img src={post.cover_image} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:2, flexShrink:0 }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{post.title}</p>
                <p className="text-xs opacity-40 mt-1">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')} · obicha.com.br/blog/{post.slug}
                </p>
              </div>
              <span className="text-xs px-3 py-1 font-bebas tracking-widest flex-shrink-0" style={{
                background: post.published ? 'rgba(0,200,100,.1)' : 'rgba(255,255,255,.05)',
                color: post.published ? '#4ade80' : 'rgba(242,235,217,.4)',
                border: `1px solid ${post.published ? 'rgba(0,200,100,.3)' : 'rgba(255,255,255,.1)'}`,
              }}>
                {post.published ? 'Publicado' : 'Rascunho'}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(post)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)' }}>
                  {post.published ? 'Despublicar' : 'Publicar'}
                </button>
                <button onClick={() => openEdit(post)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(255,255,255,.08)', color: 'var(--creme)' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(post.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,.15)', color: 'var(--red)' }}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal editor */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--navy)', border: '1px solid var(--gold)', width: '90vw', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
              {editPost ? 'Editar Post' : 'Novo Post'}
            </h2>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Título</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do post" />
              </div>

              {/* Resumo */}
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Resumo (aparece na lista)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Um parágrafo curto sobre o post..." />
              </div>

              {/* Capa */}
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Imagem de Capa</label>
                <div
                  style={{ width:'100%', height:180, border:'2px dashed rgba(212,168,67,.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', borderRadius:2 }}
                  onClick={() => fileRef.current?.click()}
                >
                  {coverPreview
                    ? <img src={coverPreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ opacity:.3, fontSize:'.85rem' }}>Clique para selecionar capa</span>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
              </div>

              {/* Editor */}
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Conteúdo</label>
                {/* Toolbar */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem', padding:'.5rem', background:'rgba(0,0,0,.3)', borderBottom:'1px solid rgba(212,168,67,.2)', marginBottom:0 }}>
                  {toolbarBtn('N', () => execFormat('bold'))}
                  {toolbarBtn('I', () => execFormat('italic'))}
                  {toolbarBtn('U', () => execFormat('underline'))}
                  {toolbarBtn('H2', () => execFormat('formatBlock', 'h2'))}
                  {toolbarBtn('H3', () => execFormat('formatBlock', 'h3'))}
                  {toolbarBtn('§', () => execFormat('formatBlock', 'p'))}
                  {toolbarBtn('" "', () => execFormat('formatBlock', 'blockquote'))}
                  {toolbarBtn('🔗', () => {
                    const url = prompt('URL do link:')
                    if (url) execFormat('createLink', url)
                  })}
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    minHeight: 280,
                    padding: '1rem',
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(212,168,67,.3)',
                    borderTop: 'none',
                    color: 'var(--creme)',
                    outline: 'none',
                    lineHeight: 1.8,
                    fontSize: '.95rem',
                  }}
                />
              </div>

              {/* Publicar */}
              <label style={{ display:'flex', alignItems:'center', gap:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                <span className="text-sm opacity-70">Publicar agora</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,.2)', color: 'rgba(242,235,217,.5)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bebas tracking-widest" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                {saving ? 'Salvando...' : editPost ? 'Salvar alterações' : 'Criar Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
