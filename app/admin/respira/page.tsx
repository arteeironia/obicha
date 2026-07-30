'use client'

import { useState, useEffect } from 'react'

type Profile = {
  user_id: string
  display_name: string | null
  photo_url: string | null
  quit_at: string
  cigs_per_day: number
  price_per_pack: string
  cigs_per_pack: number
  is_admin: boolean
  created_at: string
  fissuras_vencidas: string
  posts_forum: string
}

type ForumPost = { id: number; user_id: string; display_name: string | null; content: string; created_at: string; approved?: boolean; total_denuncias?: string }

type ContentItem = { id: number; type: 'video' | 'texto' | 'materia'; title: string; body: string | null; url: string | null; source: string | null; description: string | null; position: number; active: boolean }

const cardStyle = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 4 }

export default function RespiraAdminPage() {
  const [tab, setTab] = useState<'usuarios' | 'moderacao' | 'conteudo'>('usuarios')
  const [content, setContent] = useState<ContentItem[]>([])
  const [contentForm, setContentForm] = useState<{ id: number | null; type: 'video' | 'texto' | 'materia'; title: string; body: string; url: string; source: string; description: string }>({
    id: null, type: 'texto', title: '', body: '', url: '', source: '', description: '',
  })
  const [savingContent, setSavingContent] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [hidden, setHidden] = useState<ForumPost[]>([])
  const [reported, setReported] = useState<ForumPost[]>([])
  const [allPosts, setAllPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    const [p, f, c] = await Promise.all([
      fetch('/api/admin/respira').then(r => r.json()),
      fetch('/api/admin/respira/forum').then(r => r.json()),
      fetch('/api/admin/respira/content').then(r => r.json()),
    ])
    setProfiles(p)
    setHidden(f.hidden || [])
    setReported(f.reported || [])
    setAllPosts(f.allPosts || [])
    setContent(c || [])
    setLoading(false)
  }

  function resetContentForm() {
    setContentForm({ id: null, type: 'texto', title: '', body: '', url: '', source: '', description: '' })
  }

  async function saveContent() {
    setSavingContent(true)
    const method = contentForm.id ? 'PATCH' : 'POST'
    const body = contentForm.id ? contentForm : { ...contentForm, id: undefined }
    await fetch('/api/admin/respira/content', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    resetContentForm()
    await load()
    setSavingContent(false)
  }

  function editContent(item: ContentItem) {
    setContentForm({
      id: item.id, type: item.type, title: item.title,
      body: item.body || '', url: item.url || '', source: item.source || '', description: item.description || '',
    })
  }

  async function toggleContentActive(item: ContentItem) {
    await fetch('/api/admin/respira/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    })
    setContent(cur => cur.map(c => c.id === item.id ? { ...c, active: !item.active } : c))
  }

  async function deleteContent(id: number) {
    await fetch('/api/admin/respira/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setContent(cur => cur.filter(c => c.id !== id))
  }

  useEffect(() => { load() }, [])

  async function toggleAdmin(user_id: string, current: boolean) {
    await fetch('/api/admin/respira', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, is_admin: !current }),
    })
    setProfiles(cur => cur.map(p => p.user_id === user_id ? { ...p, is_admin: !current } : p))
  }

  async function deleteUser(user_id: string) {
    setDeleting(true)
    await fetch('/api/admin/respira', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    })
    setProfiles(cur => cur.filter(p => p.user_id !== user_id))
    setConfirmDelete(null)
    setDeleting(false)
  }

  async function approvePost(post_id: number, approved: boolean) {
    await fetch('/api/admin/respira/forum', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id, approved }),
    })
    setHidden(cur => cur.filter(p => p.id !== post_id))
    if (approved) load()
  }

  async function deletePost(post_id: number) {
    await fetch('/api/admin/respira/forum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id }),
    })
    setReported(cur => cur.filter(p => p.id !== post_id))
    setAllPosts(cur => cur.filter(p => p.id !== post_id))
  }

  function daysSince(quitAt: string) {
    return Math.max(0, Math.floor((Date.now() - new Date(quitAt).getTime()) / 86400000))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>🫁 Respira — Gerenciar</h1>
        <p className="opacity-50 text-sm mt-1">Usuários, dados e moderação do fórum</p>
      </div>

      <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid rgba(212,168,67,.2)' }}>
        {[['usuarios', `Usuários (${profiles.length})`], ['moderacao', `Moderação (${hidden.length} ocultos · ${reported.length} denúncias)`], ['conteudo', `Conteúdo (${content.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className="px-4 py-2.5 text-sm font-bebas tracking-widest"
            style={{ color: tab === key ? 'var(--gold)' : 'rgba(242,235,217,.5)', borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : tab === 'usuarios' ? (
        <div className="space-y-3">
          {profiles.length === 0 && <p className="opacity-40 text-sm">Ninguém cadastrado ainda.</p>}
          {profiles.map(p => (
            <div key={p.user_id} style={cardStyle} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {p.photo_url && <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />}
                <div>
                  <p className="text-sm font-bold">{p.display_name || 'Sem nome'} {p.is_admin && <span style={{ color: 'var(--gold)' }} className="text-xs ml-1">★ admin</span>}</p>
                  <p className="text-xs opacity-50">
                    {daysSince(p.quit_at)} dias · {p.cigs_per_day} cig/dia · {p.fissuras_vencidas} fissuras vencidas · {p.posts_forum} posts no fórum
                  </p>
                  <p className="text-[11px] opacity-30 mt-0.5">cadastrado em {new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => toggleAdmin(p.user_id, p.is_admin)}
                  className="text-xs px-3 py-1.5 font-bebas tracking-widest"
                  style={{ background: p.is_admin ? 'rgba(212,168,67,.15)' : 'rgba(255,255,255,.03)', color: p.is_admin ? 'var(--gold)' : 'rgba(242,235,217,.6)', border: '1px solid rgba(212,168,67,.2)' }}>
                  {p.is_admin ? 'REMOVER ADMIN' : 'TORNAR ADMIN'}
                </button>
                {confirmDelete === p.user_id ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => deleteUser(p.user_id)} disabled={deleting}
                      className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'var(--red)', color: 'white' }}>
                      {deleting ? '...' : 'CONFIRMAR'}
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 opacity-50">cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(p.user_id)}
                    className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ color: 'var(--red)', border: '1px solid rgba(192,40,28,.3)' }}>
                    EXCLUIR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'moderacao' ? (
        <div>
          {hidden.length > 0 && (
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase opacity-60 mb-3" style={{ color: 'var(--gold)' }}>🔒 Ocultos por denúncias (3+), aguardando revisão</p>
              <div className="space-y-2">
                {hidden.map(post => (
                  <div key={post.id} style={{ ...cardStyle, borderColor: 'rgba(212,168,67,.4)' }} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs opacity-70">{post.display_name || 'Alguém'}</span>
                      <span className="text-xs" style={{ color: 'var(--gold)' }}>{post.total_denuncias} denúncia{post.total_denuncias !== '1' ? 's' : ''}</span>
                    </div>
                    <p className="text-sm mb-3">{post.content}</p>
                    <div className="flex gap-2">
                      <button onClick={() => approvePost(post.id, true)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: '#4ade80', color: 'var(--navy)' }}>
                        LIBERAR
                      </button>
                      <button onClick={() => { setHidden(cur => cur.filter(p => p.id !== post.id)); deletePost(post.id); }} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ color: 'var(--red)', border: '1px solid rgba(192,40,28,.3)' }}>
                        EXCLUIR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reported.length > 0 && (
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase opacity-60 mb-3" style={{ color: 'var(--red)' }}>⚠ Posts denunciados</p>
              <div className="space-y-2">
                {reported.map(post => (
                  <div key={post.id} style={{ ...cardStyle, borderColor: 'rgba(192,40,28,.4)' }} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs opacity-70">{post.display_name || 'Alguém'}</span>
                      <div className="flex items-center gap-2">
                        {!post.approved && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)' }}>oculto</span>}
                        <span className="text-xs" style={{ color: 'var(--red)' }}>{post.total_denuncias} denúncia{post.total_denuncias !== '1' ? 's' : ''}</span>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{post.content}</p>
                    <button onClick={() => deletePost(post.id)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'var(--red)', color: 'white' }}>
                      EXCLUIR POST
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs tracking-widest uppercase opacity-60 mb-3">Todos os posts recentes</p>
            <div className="space-y-2">
              {allPosts.length === 0 && <p className="opacity-40 text-sm">Nenhum post no fórum ainda.</p>}
              {allPosts.map(post => (
                <div key={post.id} style={cardStyle} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs opacity-70">{post.display_name || 'Alguém'}</span>
                    <span className="text-xs opacity-40">{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-sm mb-3">{post.content}</p>
                  <button onClick={() => deletePost(post.id)} className="text-xs px-3 py-1.5 opacity-50 underline">excluir</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={cardStyle} className="p-5 mb-8">
            <p className="text-xs tracking-widest uppercase opacity-60 mb-4">{contentForm.id ? 'Editar item' : 'Novo item de conteúdo'}</p>

            <div className="flex gap-2 mb-4">
              {(['texto', 'video', 'materia'] as const).map(t => (
                <button key={t} onClick={() => setContentForm(f => ({ ...f, type: t }))}
                  className="px-4 py-2 text-xs font-bebas tracking-widest"
                  style={{ background: contentForm.type === t ? 'var(--gold)' : 'rgba(212,168,67,.1)', color: contentForm.type === t ? 'var(--navy)' : 'var(--gold)' }}>
                  {t === 'texto' ? 'TEXTO' : t === 'video' ? 'VÍDEO' : 'MATÉRIA'}
                </button>
              ))}
            </div>

            <input
              value={contentForm.title}
              onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Título"
              className="w-full mb-3 px-3 py-2.5 text-sm"
              style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.2)', color: 'var(--creme)' }}
            />

            {contentForm.type === 'texto' && (
              <textarea
                value={contentForm.body}
                onChange={e => setContentForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Texto completo (pode ter vários parágrafos)"
                rows={6}
                className="w-full mb-3 px-3 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.2)', color: 'var(--creme)' }}
              />
            )}

            {(contentForm.type === 'video' || contentForm.type === 'materia') && (
              <input
                value={contentForm.url}
                onChange={e => setContentForm(f => ({ ...f, url: e.target.value }))}
                placeholder={contentForm.type === 'video' ? 'Link do vídeo (YouTube, etc)' : 'Link da matéria'}
                className="w-full mb-3 px-3 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.2)', color: 'var(--creme)' }}
              />
            )}

            {contentForm.type === 'materia' && (
              <input
                value={contentForm.source}
                onChange={e => setContentForm(f => ({ ...f, source: e.target.value }))}
                placeholder="Nome do site/veículo (ex: Ministério da Saúde)"
                className="w-full mb-3 px-3 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.2)', color: 'var(--creme)' }}
              />
            )}

            <textarea
              value={contentForm.description}
              onChange={e => setContentForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Resumo curto (opcional)"
              rows={2}
              className="w-full mb-4 px-3 py-2.5 text-sm"
              style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.2)', color: 'var(--creme)' }}
            />

            <div className="flex gap-2">
              <button onClick={saveContent} disabled={savingContent || !contentForm.title.trim()}
                className="px-5 py-2.5 text-sm font-bebas tracking-widest"
                style={{ background: 'var(--gold)', color: 'var(--navy)', opacity: savingContent || !contentForm.title.trim() ? 0.5 : 1 }}>
                {savingContent ? 'SALVANDO...' : contentForm.id ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR'}
              </button>
              {contentForm.id && (
                <button onClick={resetContentForm} className="px-4 py-2.5 text-sm opacity-50">cancelar edição</button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {content.length === 0 && <p className="opacity-40 text-sm">Nenhum conteúdo cadastrado ainda.</p>}
            {content.map(item => (
              <div key={item.id} style={{ ...cardStyle, opacity: item.active ? 1 : 0.5 }} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,.15)', color: 'var(--gold)' }}>
                      {item.type === 'texto' ? 'TEXTO' : item.type === 'video' ? 'VÍDEO' : 'MATÉRIA'}
                    </span>
                    {!item.active && <span className="text-[10px] opacity-40">oculto</span>}
                  </div>
                  <p className="text-sm font-bold truncate">{item.title}</p>
                  {item.source && <p className="text-xs opacity-50">{item.source}</p>}
                  {item.url && <p className="text-xs opacity-40 truncate">{item.url}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => editContent(item)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: 'rgba(212,168,67,.1)', color: 'var(--gold)' }}>EDITAR</button>
                  <button onClick={() => toggleContentActive(item)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: item.active ? 'rgba(192,40,28,.1)' : 'rgba(74,222,128,.1)', color: item.active ? 'var(--red)' : '#4ade80' }}>
                    {item.active ? 'OCULTAR' : 'ATIVAR'}
                  </button>
                  <button onClick={() => deleteContent(item.id)} className="text-xs px-2 opacity-50">excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
