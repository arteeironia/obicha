'use client'
import { useState } from 'react'

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 text-center tracking-widest outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--creme)', paddingRight: '3rem' }}
        autoFocus
      />
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

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      const data = await res.json()
      setError(data.error || 'Senha incorreta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)' }}>
      <div className="w-full max-w-sm p-8 border" style={{ borderColor: 'var(--gold)' }}>
        <div className="text-center mb-8">
          <span className="font-bebas text-4xl" style={{ color: 'var(--gold)' }}>Ô<span style={{ color: 'var(--red)' }}>bicha</span>!</span>
          <p className="text-sm mt-2 opacity-50 tracking-widest uppercase">Painel Admin</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <PasswordInput value={password} onChange={setPassword} placeholder="Senha" />
          {error && <p className="text-sm text-center" style={{ color: 'var(--red)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 font-bebas tracking-widest text-lg transition-all"
            style={{ background: loading ? 'rgba(212,168,67,0.5)' : 'var(--gold)', color: 'var(--navy)' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center mt-6 text-xs opacity-30">⚠️ Troque a senha temporária nas configurações após o primeiro login</p>
      </div>
    </div>
  )
}
