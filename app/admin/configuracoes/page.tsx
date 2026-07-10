'use client'
import { useState } from 'react'

function PasswordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} required
        className="w-full px-4 py-3 outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--creme)', paddingRight: '3rem' }} />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: .5, color: 'var(--creme)', padding: 0 }}>
        {show ? (
          <svg viewBox="0 0 24 24" style={{ width:18, height:18, fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' }}>
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" style={{ width:18, height:18, fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' }}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export default function AdminConfiguracoes() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    if (newPassword !== confirmPassword) { setStatus({ type: 'error', message: 'As senhas não coincidem' }); return }
    if (newPassword.length < 8) { setStatus({ type: 'error', message: 'A nova senha deve ter ao menos 8 caracteres' }); return }
    setLoading(true)
    const res = await fetch('/api/auth', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
    const data = await res.json()
    if (res.ok) {
      setStatus({ type: 'success', message: '✅ Senha alterada com sucesso!' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } else {
      setStatus({ type: 'error', message: data.error || 'Erro ao alterar senha' })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>Configurações</h1>
      <p className="opacity-50 text-sm mb-8">Gerencie as configurações do painel admin</p>
      <div className="border rounded p-6" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bebas text-xl tracking-widest mb-6" style={{ color: 'var(--gold)' }}>🔐 Alterar Senha</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Senha Atual</label>
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Nova Senha</label>
            <PasswordInput value={newPassword} onChange={setNewPassword} />
            <p className="text-xs opacity-40 mt-1">Mínimo 8 caracteres</p>
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase opacity-60 mb-2">Confirmar Nova Senha</label>
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
          </div>
          {status && (
            <div className="px-4 py-3 rounded text-sm" style={{ background: status.type === 'success' ? 'rgba(0,200,100,0.1)' : 'rgba(192,40,28,0.1)', border: `1px solid ${status.type === 'success' ? 'rgba(0,200,100,0.3)' : 'rgba(192,40,28,0.3)'}`, color: status.type === 'success' ? '#4ade80' : 'var(--red)' }}>
              {status.message}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-3 font-bebas tracking-widest text-lg transition-all"
            style={{ background: loading ? 'rgba(212,168,67,0.5)' : 'var(--gold)', color: 'var(--navy)' }}>
            {loading ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
      <div className="border rounded p-6 mt-6" style={{ borderColor: 'rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bebas text-xl tracking-widest mb-4" style={{ color: 'var(--gold)' }}>🌐 Links Rápidos</h2>
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
