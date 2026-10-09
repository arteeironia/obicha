'use client'

import { useState, useEffect } from 'react'

type TopItem = { path?: string; label?: string; source?: string; supplier?: string; collection?: string; campaign?: string; views?: string; clicks?: string; visits?: string }
type Totals = { total_pageviews: string; visitors: string; sessions: string; total_clicks: string; exits_reserva: string; exits_umapenca: string; pageviews_hoje: string; clicks_hoje: string }
type DailyView = { day: string; views: string }

const cardStyle = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 4 }

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={cardStyle} className="p-5">
      <p className="text-xs opacity-50 tracking-widest uppercase mb-2">{label}</p>
      <p className="font-bebas text-3xl" style={{ color: 'var(--gold)' }}>{value}</p>
    </div>
  )
}

function RankTable({ title, items, valueKey, labelKey }: { title: string; items: TopItem[]; valueKey: 'views' | 'clicks' | 'visits'; labelKey: 'path' | 'label' | 'source' | 'supplier' | 'collection' | 'campaign' }) {
  const max = Math.max(...items.map(i => parseInt(i[valueKey] || '0')), 1)
  return (
    <div style={cardStyle} className="p-5">
      <p className="text-xs opacity-50 tracking-widest uppercase mb-4">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm opacity-40">sem dados ainda nesse período</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const val = parseInt(item[valueKey] || '0')
            const pct = Math.round((val / max) * 100)
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="truncate" style={{ maxWidth: '75%' }}>{item[labelKey] || '—'}</span>
                  <span style={{ color: 'var(--gold)' }} className="font-bebas">{val}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 2 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<{ topPages: TopItem[]; topProducts: TopItem[]; topReferrers: TopItem[]; totals: Totals; dailyViews: DailyView[]; topSuppliers: TopItem[]; topCollections: TopItem[]; topCampaigns: TopItem[]; trackingSince: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/analytics?days=${days}`)
      .then(r => { if (!r.ok) throw new Error(r.status === 401 ? 'Sessão expirada — entre novamente no admin.' : 'Erro ao carregar relatório.'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [days])

  const maxDaily = data ? Math.max(...data.dailyViews.map(d => parseInt(d.views || '0')), 1) : 1

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Analytics</h1>
          <p className="opacity-50 text-sm mt-1">Páginas, produtos e origem do tráfego</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className="px-4 py-2 text-sm font-bebas tracking-widest"
              style={{ background: days === d ? 'var(--gold)' : 'rgba(212,168,67,.1)', color: days === d ? 'var(--navy)' : 'var(--gold)' }}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : error || !data ? (
        <p style={{ color: 'var(--red)' }}>{error || 'Sem dados.'}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Visitantes únicos (estimado)" value={data.totals.visitors || 0} />
            <StatCard label="Sessões" value={data.totals.sessions || 0} />
            <StatCard label="Visualizações de página" value={data.totals.total_pageviews || 0} />
            <StatCard label="Cliques em produtos" value={data.totals.total_clicks || 0} />
            <StatCard label="Saídas p/ Reserva Ink" value={data.totals.exits_reserva || 0} />
            <StatCard label="Saídas p/ Uma Penca" value={data.totals.exits_umapenca || 0} />
            <StatCard label="Visualizações hoje" value={data.totals.pageviews_hoje || 0} />
            <StatCard label="Cliques hoje" value={data.totals.clicks_hoje || 0} />
          </div>
          <p className="text-xs opacity-40 mb-8">
            Visitantes e sessões contam apenas quem aceitou os cookies{data.trackingSince ? `, a partir de ${new Date(data.trackingSince).toLocaleDateString('pt-BR')}` : ' (ainda sem dados)'}. Visitante único é uma estimativa por navegador/aparelho. Seus acessos de administrador não são contados.
          </p>

          {data.dailyViews.length > 1 && (
            <div style={cardStyle} className="p-5 mb-8">
              <p className="text-xs opacity-50 tracking-widest uppercase mb-4">Visualizações por dia</p>
              <div className="flex items-end gap-1" style={{ height: 100 }}>
                {data.dailyViews.map((d, i) => (
                  <div key={i} style={{ flex: 1, height: `${(parseInt(d.views) / maxDaily) * 100}%`, background: 'var(--gold)', opacity: .7, borderRadius: '2px 2px 0 0', minHeight: 2 }} title={`${d.day}: ${d.views}`} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RankTable title="Páginas mais visitadas" items={data.topPages} valueKey="views" labelKey="path" />
            <RankTable title="Produtos mais clicados" items={data.topProducts} valueKey="clicks" labelKey="label" />
            <RankTable title="De onde vem o tráfego (sessões)" items={data.topReferrers} valueKey="visits" labelKey="source" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <RankTable title="Cliques por fabricante" items={data.topSuppliers} valueKey="clicks" labelKey="supplier" />
            <RankTable title="Cliques por coleção" items={data.topCollections} valueKey="clicks" labelKey="collection" />
          </div>
          {data.topCampaigns.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <RankTable title="Campanhas (UTM)" items={data.topCampaigns} valueKey="visits" labelKey="campaign" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
