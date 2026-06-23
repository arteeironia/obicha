'use client'

import { useState, useEffect } from 'react'

type Stat = {
  id: number
  label: string
  url: string
  active: boolean
  total_cliques: string
  cliques_hoje: string
  cliques_semana: string
  cliques_mes: string
}

export default function AuditoriaCliques() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/links?stats=true').then(r => r.json()).then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  const totalGeral = stats.reduce((acc, s) => acc + parseInt(s.total_cliques || '0'), 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Auditoria de Cliques</h1>
        <p className="opacity-50 text-sm mt-1">Rastreamento de cliques da página obicha.com.br/links</p>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total de Cliques', value: totalGeral },
          { label: 'Hoje', value: stats.reduce((acc, s) => acc + parseInt(s.cliques_hoje || '0'), 0) },
          { label: 'Últimos 7 dias', value: stats.reduce((acc, s) => acc + parseInt(s.cliques_semana || '0'), 0) },
          { label: 'Últimos 30 dias', value: stats.reduce((acc, s) => acc + parseInt(s.cliques_mes || '0'), 0) },
        ].map(card => (
          <div key={card.label} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.15)', borderRadius: 4, padding: '1.5rem' }}>
            <p className="text-xs tracking-widest uppercase opacity-50 mb-1">{card.label}</p>
            <p className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela por link */}
      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : (
        <div style={{ border: '1px solid rgba(212,168,67,.15)', borderRadius: 4, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(212,168,67,.08)', borderBottom: '1px solid rgba(212,168,67,.15)' }}>
                {['Link', 'Hoje', '7 dias', '30 dias', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '.75rem 1rem', textAlign: 'left', fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: .6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => {
                const total = parseInt(s.total_cliques || '0')
                const pct = totalGeral > 0 ? Math.round((total / totalGeral) * 100) : 0
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(212,168,67,.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                    <td style={{ padding: '.9rem 1rem' }}>
                      <p className="font-bold text-sm">{s.label}</p>
                      <p className="text-xs opacity-30 truncate" style={{ maxWidth: 200 }}>{s.url}</p>
                      {/* Barra de proporção */}
                      <div style={{ marginTop: '.4rem', height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, width: 120 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width .5s' }} />
                      </div>
                      <p style={{ fontSize: '.65rem', opacity: .3, marginTop: '.2rem' }}>{pct}% do total</p>
                    </td>
                    <td style={{ padding: '.9rem 1rem', fontFamily: 'var(--font-bebas)', fontSize: '1.1rem', color: 'var(--gold)' }}>
                      {s.cliques_hoje}
                    </td>
                    <td style={{ padding: '.9rem 1rem', fontFamily: 'var(--font-bebas)', fontSize: '1.1rem' }}>
                      {s.cliques_semana}
                    </td>
                    <td style={{ padding: '.9rem 1rem', fontFamily: 'var(--font-bebas)', fontSize: '1.1rem' }}>
                      {s.cliques_mes}
                    </td>
                    <td style={{ padding: '.9rem 1rem', fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', color: 'var(--gold)' }}>
                      {total}
                    </td>
                    <td style={{ padding: '.9rem 1rem' }}>
                      <span style={{ fontSize: '.75rem', color: s.active ? '#4ade80' : 'rgba(242,235,217,.3)' }}>
                        {s.active ? '● Ativo' : '○ Oculto'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
