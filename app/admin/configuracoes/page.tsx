'use client'

import { useState } from 'react'

export default function AdminConfiguracoes() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'As senhas não coincidem' })
      return
    }

    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'A nova senha deve ter ao menos 8 caracteres' })
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus({ type: 'success', message: '✅ Senha alterada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setStatus({ type: 'error', message: data.error || 'Erro ao alterar senha' })
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
        Configurações
      </h1>
      <p className="opacity-50 text-sm mb-8">Gerencie as configurações do painel admin</p>

      {/* Troca de senha */}
      <div className="border rounded p-6" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bebas text-xl tracking-widest mb-6" style={{ color: 'var(--gold)' }}>
          🔐 Alterar Senha
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">
              Senha Atual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,168,67,0.3)',
                color: 'var(--creme)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,168,67,0.3)',
                color: 'var(--creme)',
              }}
            />
            <p className="text-xs opacity-40 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,168,67,0.3)',
                color: 'var(--creme)',
              }}
            />
          </div>

          {status && (
            <div
              className="px-4 py-3 rounded text-sm"
              style={{
                background: status.type === 'success' ? 'rgba(0,200,100,0.1)' : 'rgba(192,40,28,0.1)',
                border: `1px solid ${status.type === 'success' ? 'rgba(0,200,100,0.3)' : 'rgba(192,40,28,0.3)'}`,
                color: status.type === 'success' ? '#4ade80' : 'var(--red)',
              }}
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bebas tracking-widest text-lg transition-all"
            style={{
              background: loading ? 'rgba(212,168,67,0.5)' : 'var(--gold)',
              color: 'var(--navy)',
            }}
          >
            {loading ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* Info do site */}
      <div className="border rounded p-6 mt-6" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bebas text-xl tracking-widest mb-4" style={{ color: 'var(--gold)' }}>
          🌐 Links Rápidos
        </h2>
        <div className="space-y-2 text-sm opacity-60">
          <p>🛍 Loja: <a href="https://umapenca.com/obicha/" target="_blank" className="underline" style={{ color: 'var(--gold)' }}>umapenca.com/obicha</a></p>
          <p>📷 Instagram: <a href="https://www.instagram.com/obicha_camisetas/" target="_blank" className="underline" style={{ color: 'var(--gold)' }}>@obicha_camisetas</a></p>
          <p>🎵 TikTok: <a href="https://www.tiktok.com/@arteironia" target="_blank" className="underline" style={{ color: 'var(--gold)' }}>@arteironia</a></p>
          <p>📌 Pinterest: <a href="https://br.pinterest.com/Obicha_camisetas/" target="_blank" className="underline" style={{ color: 'var(--gold)' }}>Obicha_camisetas</a></p>
          <p>💬 WhatsApp: <a href="https://wa.me/5519982925769" target="_blank" className="underline" style={{ color: 'var(--gold)' }}>+55 19 98292-5769</a></p>
        </div>
      </div>
    </div>
  )
}
