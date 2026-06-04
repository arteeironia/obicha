'use client'

import { useState, useEffect } from 'react'

const fields = [
  { key: 'instagram_url', label: 'Instagram', placeholder: 'https://www.instagram.com/...' },
  { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://www.tiktok.com/@...' },
  { key: 'pinterest_url', label: 'Pinterest', placeholder: 'https://br.pinterest.com/...' },
  { key: 'whatsapp_url', label: 'WhatsApp', placeholder: 'https://wa.me/55...' },
  { key: 'loja_url', label: 'Link da Loja', placeholder: 'https://...' },
]

export default function AdminSiteConfig() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/site-config')
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
  }, [])

  async function handleSave() {
    setSaving(true)
    setStatus('idle')
    const res = await fetch('/api/site-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setStatus(res.ok ? 'success' : 'error')
    setSaving(false)
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

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
        Links do Site
      </h1>
      <p className="opacity-50 text-sm mb-8">Gerencie os links das redes sociais e da loja</p>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : (
        <div className="border rounded p-6 space-y-4" style={{ borderColor: 'rgba(212,168,67,.2)', background: 'rgba(255,255,255,.02)' }}>
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">{field.label}</label>
              <input
                style={inputStyle}
                value={config[field.key] || ''}
                onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {status === 'success' && (
            <p style={{ color: '#4ade80', fontSize: '.85rem' }}>✅ Links atualizados com sucesso!</p>
          )}
          {status === 'error' && (
            <p style={{ color: 'var(--red)', fontSize: '.85rem' }}>❌ Erro ao salvar. Tenta novamente.</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 font-bebas tracking-widest text-lg"
            style={{ background: saving ? 'rgba(212,168,67,.5)' : 'var(--gold)', color: 'var(--navy)' }}
          >
            {saving ? 'Salvando...' : 'Salvar Links'}
          </button>
        </div>
      )}
    </div>
  )
}
