'use client'
import { useState } from 'react'
import type { ReviewState } from '@/lib/reserva-reviews'
import { REVIEW_SOURCE } from '@/lib/reserva-reviews'
const button = { border: '1px solid #D4A843', padding: '10px 16px', borderRadius: 4 }
export default function AdminReviews({ initial }: { initial: ReviewState }) {
  const [state, setState] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  async function save(action: 'save' | 'import') {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, revision: state.revision, enabled: state.enabled, hiddenIds: state.hiddenIds, featuredIds: state.featuredIds }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar.')
      setState(result); setDirty(false); setMessage(action === 'import' ? `${result.total} avaliações importadas. A seleção de destaques foi preservada.` : 'Seleção publicada no site.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar.') } finally { setBusy(false) }
  }
  function toggle(id: string, key: 'hiddenIds' | 'featuredIds') {
    setState(s => ({ ...s, [key]: s[key].includes(id) ? s[key].filter(x => x !== id) : [...s[key], id] })); setDirty(true)
  }
  return <div className="p-4 md:p-8" style={{ color: '#F2EBD9', maxWidth: 1100 }}>
    <h1 className="font-playfair text-3xl" style={{ color: '#D4A843' }}>Avaliações de clientes</h1>
    <p className="mt-4 text-sm">{state.average.toFixed(1).replace('.', ',')}/5 · {state.total} avaliações da loja na Reserva Ink. Importadas em {new Date(state.importedAt).toLocaleString('pt-BR')}.</p>
    <p className="mt-3 text-sm opacity-70">As notas, nomes e textos vêm da origem e não são editados aqui. Marque os destaques da home ou oculte uma avaliação. A média sempre considera todas as notas importadas.</p>
    <div className="flex flex-wrap gap-3 my-6"><button style={button} disabled={busy || dirty} onClick={() => save('import')}>{busy ? 'Aguarde…' : 'Importar da Reserva Ink'}</button><button style={{ ...button, background: '#C0281C' }} disabled={busy || !dirty} onClick={() => save('save')}>Salvar e publicar seleção</button><a style={button} href="/avaliacoes" target="_blank" rel="noopener noreferrer">Ver no site ↗</a><a style={button} href={REVIEW_SOURCE} target="_blank" rel="noopener noreferrer">Conferir origem ↗</a></div>
    {dirty && <p className="text-sm mb-4">Há alterações não salvas. Salve a seleção antes de importar novamente.</p>}
    <p role="status" className="mb-4 text-sm">{message}</p>
    <label className="flex gap-3 mb-6"><input type="checkbox" checked={state.enabled} disabled={busy} onChange={e => { setState({ ...state, enabled: e.target.checked }); setDirty(true) }}/>Exibir avaliações no site</label>
    <div className="space-y-4">{state.reviews.map(r => <article key={r.id} className="p-5" style={{ border: '1px solid #D4A84355', borderRadius: 4 }}><p style={{ color: '#D4A843' }}>{r.rating}/5 · {r.author} · {r.date}</p><p className="text-sm mt-3" style={{ whiteSpace: 'pre-line' }}>{r.text || 'Sem comentário escrito.'}</p><p className="text-xs mt-3 opacity-70">{r.products.map(p => p.name).join(' · ')}</p><div className="flex flex-wrap gap-6 mt-4 text-sm"><label className="flex gap-2"><input type="checkbox" disabled={busy} checked={state.featuredIds.includes(r.id)} onChange={() => toggle(r.id, 'featuredIds')}/>Destaque na home</label><label className="flex gap-2"><input type="checkbox" disabled={busy} checked={state.hiddenIds.includes(r.id)} onChange={() => toggle(r.id, 'hiddenIds')}/>Ocultar no site</label></div></article>)}</div>
  </div>
}
