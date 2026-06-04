'use client'

import { useState, useEffect, useRef } from 'react'

type Pin = { id: number; image_url: string; pin_url: string | null; created_at: string }

export default function AdminPinterest() {
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pinUrl, setPinUrl] = useState('')
  const [imageData, setImageData] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch('/api/pinterest')
    setPins(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setImagePreview(url)
    setImageData(url)
  }

  async function handleSave() {
    if (!imageData) { alert('Selecione uma imagem!'); return }
    setSaving(true)
    await fetch('/api/pinterest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageData, pin_url: pinUrl || null }),
    })
    await load()
    setShowForm(false)
    setImagePreview(null)
    setImageData(null)
    setPinUrl('')
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este pin?')) return
    await fetch('/api/pinterest', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: 'var(--gold)' }}>Pinterest</h1>
          <p className="opacity-50 text-sm mt-1">Galeria de pins — {pins.length} imagens</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3 font-bebas tracking-widest" style={{ background: '#E60023', color: 'white' }}>
          + Adicionar Pin
        </button>
      </div>

      <p className="text-sm opacity-50 mb-6">Suba prints ou imagens dos seus pins. Os cards aparecem na seção de redes sociais da landing page.</p>

      {loading ? (
        <p className="opacity-50">Carregando...</p>
      ) : pins.length === 0 ? (
        <div className="border border-dashed rounded p-12 text-center opacity-30" style={{ borderColor: 'rgba(212,168,67,0.3)' }}>
          <p className="text-4xl mb-3">📌</p>
          <p>Nenhum pin adicionado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {pins.map(pin => (
            <div key={pin.id} className="border rounded overflow-hidden" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="aspect-square relative">
                <img src={pin.image_url} alt="Pin Pinterest" className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex gap-2">
                {pin.pin_url && (
                  <a href={pin.pin_url} target="_blank" className="flex-1 py-1.5 text-xs font-bebas tracking-widest text-center" style={{ background: 'rgba(230,0,35,0.15)', color: '#E60023' }}>
                    ↗ Ver Pin
                  </a>
                )}
                <button onClick={() => handleDelete(pin.id)} className="flex-1 py-1.5 text-xs font-bebas tracking-widest" style={{ background: 'rgba(192,40,28,0.15)', color: 'var(--red)' }}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md p-8 border" style={{ background: 'var(--navy)', borderColor: '#E60023' }}>
            <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: '#E60023' }}>📌 Novo Pin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Imagem do Pin</label>
                <div
                  className="w-full aspect-square flex items-center justify-center cursor-pointer border-2 border-dashed overflow-hidden"
                  style={{ borderColor: 'rgba(230,0,35,0.4)' }}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    : <span className="opacity-30 text-sm text-center p-4">📌 Clique para selecionar<br />o print do pin</span>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Link do Pin (opcional)</label>
                <input
                  value={pinUrl}
                  onChange={e => setPinUrl(e.target.value)}
                  placeholder="https://br.pinterest.com/pin/..."
                  className="w-full px-4 py-3 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--creme)' }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setImagePreview(null); setImageData(null); setPinUrl('') }} className="flex-1 py-3 font-bebas tracking-widest border" style={{ borderColor: 'rgba(242,235,217,0.2)', color: 'rgba(242,235,217,0.5)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 font-bebas tracking-widest" style={{ background: '#E60023', color: 'white' }}>
                {saving ? 'Salvando...' : 'Adicionar Pin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
