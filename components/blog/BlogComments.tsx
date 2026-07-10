'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Comment = {
  id: number
  post_slug: string
  parent_id: number | null
  user_id: string
  user_name: string
  user_avatar: string | null
  user_email: string | null
  content: string
  created_at: string
}

type User = {
  id: string
  email?: string
  user_metadata?: { full_name?: string; avatar_url?: string }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 30) return `${days}d atrás`
  return new Date(date).toLocaleDateString('pt-BR')
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) return <img src={src} alt={name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-bebas)', fontSize: '1rem', color: 'var(--navy)' }}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

function CommentForm({ slug, parentId, onSuccess, onCancel, user, token }: {
  slug: string; parentId?: number; onSuccess: () => void; onCancel?: () => void; user: User; token: string
}) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!content.trim()) return
    setSaving(true)
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ slug, content, parent_id: parentId }),
    })
    setContent('')
    setSaving(false)
    onSuccess()
  }

  return (
    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
      <Avatar src={user.user_metadata?.avatar_url || null} name={user.user_metadata?.full_name || user.email || 'U'} />
      <div style={{ flex: 1 }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={parentId ? 'Escreva uma resposta...' : 'Escreva um comentário...'}
          style={{
            width: '100%', minHeight: parentId ? 80 : 100,
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(212,168,67,.3)',
            color: 'var(--creme)', padding: '.75rem 1rem',
            fontFamily: 'inherit', fontSize: '.9rem',
            resize: 'vertical', outline: 'none', borderRadius: 4,
          }}
        />
        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button onClick={onCancel} style={{ padding: '.4rem 1rem', background: 'transparent', border: '1px solid rgba(242,235,217,.2)', color: 'rgba(242,235,217,.5)', fontFamily: 'var(--font-bebas)', letterSpacing: '1px', fontSize: '.8rem', cursor: 'pointer', borderRadius: 2 }}>
              Cancelar
            </button>
          )}
          <button onClick={handleSubmit} disabled={saving || !content.trim()} style={{ padding: '.4rem 1.2rem', background: 'var(--gold)', color: 'var(--navy)', fontFamily: 'var(--font-bebas)', letterSpacing: '1px', fontSize: '.8rem', cursor: 'pointer', border: 'none', borderRadius: 2, opacity: saving || !content.trim() ? .6 : 1 }}>
            {saving ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment, replies, user, token, onRefresh, slug }: {
  comment: Comment; replies: Comment[]; user: User | null; token: string | null; onRefresh: () => void; slug: string
}) {
  const [replying, setReplying] = useState(false)

  async function handleDelete() {
    if (!confirm('Remover este comentário?')) return
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id }),
    })
    onRefresh()
  }

  const isOwner = user?.id === comment.user_id

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
        <Avatar src={comment.user_avatar} name={comment.user_name} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.4rem' }}>
            <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{comment.user_name}</span>
            <span style={{ fontSize: '.75rem', opacity: .4 }}>{timeAgo(comment.created_at)}</span>
            {isOwner && (
              <button onClick={handleDelete} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(192,40,28,.6)', cursor: 'pointer', fontSize: '.75rem', fontFamily: 'var(--font-bebas)', letterSpacing: '1px' }}>
                Remover
              </button>
            )}
          </div>
          <p style={{ fontSize: '.9rem', lineHeight: 1.7, color: 'rgba(242,235,217,.8)', margin: 0 }}>{comment.content}</p>
          {user && !replying && (
            <button onClick={() => setReplying(true)} style={{ marginTop: '.5rem', background: 'none', border: 'none', color: 'rgba(212,168,67,.6)', cursor: 'pointer', fontSize: '.78rem', fontFamily: 'var(--font-bebas)', letterSpacing: '1px' }}>
              ↩ Responder
            </button>
          )}
        </div>
      </div>

      {/* Respostas */}
      {replies.length > 0 && (
        <div style={{ marginLeft: '3rem', marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(212,168,67,.1)' }}>
          {replies.map(r => (
            <CommentItem key={r.id} comment={r} replies={[]} user={user} token={token} onRefresh={onRefresh} slug={slug} />
          ))}
        </div>
      )}

      {/* Form de resposta */}
      {replying && user && token && (
        <div style={{ marginLeft: '3rem', marginTop: '1rem' }}>
          <CommentForm slug={slug} parentId={comment.id} user={user} token={token} onSuccess={() => { setReplying(false); onRefresh() }} onCancel={() => setReplying(false)} />
        </div>
      )}
    </div>
  )
}

export default function BlogComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)

  async function loadComments() {
    const res = await fetch(`/api/comments?slug=${slug}`)
    setComments(await res.json())
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user as User)
        setToken(session.access_token)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User || null)
      setToken(session?.access_token || null)
    })

    loadComments()
    return () => subscription.unsubscribe()
  }, [slug])

  async function handleLogin() {
    setLoginLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/blog/${slug}` },
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
  }

  const topLevel = comments.filter(c => !c.parent_id)
  const replies = (parentId: number) => comments.filter(c => c.parent_id === parentId)

  return (
    <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(212,168,67,.15)' }}>
      <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '.85rem', letterSpacing: '4px', color: 'var(--gold)', opacity: .7, display: 'block', marginBottom: '1.5rem' }}>
        ★ Comentários ({comments.length}) ★
      </span>

      {/* Header de usuário logado */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem', padding: '.75rem 1rem', background: 'rgba(212,168,67,.05)', border: '1px solid rgba(212,168,67,.15)', borderRadius: 4 }}>
          <Avatar src={user.user_metadata?.avatar_url || null} name={user.user_metadata?.full_name || user.email || 'U'} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '.85rem', fontWeight: 700, margin: 0 }}>{user.user_metadata?.full_name || user.email}</p>
            <p style={{ fontSize: '.75rem', opacity: .4, margin: 0 }}>Conectado com Google</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(242,235,217,.2)', color: 'rgba(242,235,217,.4)', padding: '.3rem .8rem', fontFamily: 'var(--font-bebas)', letterSpacing: '1px', fontSize: '.75rem', cursor: 'pointer', borderRadius: 2 }}>
            Sair
          </button>
        </div>
      )}

      {/* Form de novo comentário */}
      {user && token ? (
        <div style={{ marginBottom: '2.5rem' }}>
          <CommentForm slug={slug} user={user} token={token} onSuccess={loadComments} />
        </div>
      ) : !loading && (
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', border: '1px dashed rgba(212,168,67,.2)', borderRadius: 4, textAlign: 'center' }}>
          <p style={{ fontSize: '.9rem', opacity: .6, marginBottom: '1rem' }}>Faça login com sua conta Google para comentar.</p>
          <button onClick={handleLogin} disabled={loginLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1.5rem', background: 'white', color: '#333', fontWeight: 600, fontSize: '.9rem', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: loginLoading ? .7 : 1 }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loginLoading ? 'Redirecionando...' : 'Entrar com Google'}
          </button>
        </div>
      )}

      {/* Lista de comentários */}
      {topLevel.length === 0 ? (
        <p style={{ opacity: .3, fontSize: '.9rem', textAlign: 'center', padding: '2rem' }}>Nenhum comentário ainda. Seja o primeiro!</p>
      ) : (
        topLevel.map(c => (
          <CommentItem key={c.id} comment={c} replies={replies(c.id)} user={user} token={token} onRefresh={loadComments} slug={slug} />
        ))
      )}
    </div>
  )
}
