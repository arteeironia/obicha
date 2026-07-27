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

type ForumPost = { id: number; user_id: string; display_name: string | null; content: string; created_at: string; total_denuncias?: string }

const cardStyle = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 4 }

export default function RespiraAdminPage() {
  const [tab, setTab] = useState<'usuarios' | 'moderacao'>('usuarios')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [pending, setPending] = useState<ForumPost[]>([])
  const [reported, setReported] = useState<ForumPost[]>([])
  const [allPosts, setAllPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    const [p, f] = await Promise.all([
      fetch('/api/admin/respira').then(r => r.json()),
      fetch('/api/admin/respira/forum').then(r => r.json()),
    ])
    setProfiles(p)
    setPending(f.pending || [])
    setReported(f.reported || [])
    setAllPosts(f.allPosts || [])
    setLoading(false)
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
    setPending(cur => cur.filter(p => p.id !== post_id))
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>🫁 Respira — Gerenciar</h1>
        <p className="opacity-50 text-sm mt-1">Usuários, dados e moderação do fórum</p>
      </div>

      <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid rgba(212,168,67,.2)' }}>
        {[['usuarios', `Usuários (${profiles.length})`], ['moderacao', `Moderação (${pending.length} pendentes · ${reported.length} denúncias)`]].map(([key, label]) => (
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
            <div key={p.user_id} style={cardStyle} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {p.photo_url && <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full" />}
                <div>
                  <p className="text-sm font-bold">{p.display_name || 'Sem nome'} {p.is_admin && <span style={{ color: 'var(--gold)' }} className="text-xs ml-1">★ admin</span>}</p>
                  <p className="text-xs opacity-50">
                    {daysSince(p.quit_at)} dias · {p.cigs_per_day} cig/dia · {p.fissuras_vencidas} fissuras vencidas · {p.posts_forum} posts no fórum
                  </p>
                  <p className="text-[11px] opacity-30 mt-0.5">cadastrado em {new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
      ) : (
        <div>
          {pending.length > 0 && (
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase opacity-60 mb-3" style={{ color: 'var(--gold)' }}>⏳ Pendentes de aprovação</p>
              <div className="space-y-2">
                {pending.map(post => (
                  <div key={post.id} style={{ ...cardStyle, borderColor: 'rgba(212,168,67,.4)' }} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs opacity-70">{post.display_name || 'Alguém'}</span>
                      <span className="text-xs opacity-40">{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-sm mb-3">{post.content}</p>
                    <div className="flex gap-2">
                      <button onClick={() => approvePost(post.id, true)} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ background: '#4ade80', color: 'var(--navy)' }}>
                        APROVAR
                      </button>
                      <button onClick={() => { setPending(cur => cur.filter(p => p.id !== post.id)); deletePost(post.id); }} className="text-xs px-3 py-1.5 font-bebas tracking-widest" style={{ color: 'var(--red)', border: '1px solid rgba(192,40,28,.3)' }}>
                        REJEITAR E EXCLUIR
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
                      <span className="text-xs" style={{ color: 'var(--red)' }}>{post.total_denuncias} denúncia{post.total_denuncias !== '1' ? 's' : ''}</span>
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
      )}
    </div>
  )
}
