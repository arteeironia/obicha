'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      router.push('/admin')
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
          <span className="font-bebas text-4xl" style={{ color: 'var(--gold)' }}>
            Ô<span style={{ color: 'var(--red)' }}>bicha</span>!
          </span>
          <p className="text-sm mt-2 opacity-50 tracking-widest uppercase">Painel Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-center tracking-widest outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(212,168,67,0.3)',
              color: 'var(--creme)',
            }}
            autoFocus
          />

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--red)' }}>{error}</p>
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs opacity-30">
          ⚠️ Troque a senha temporária nas configurações após o primeiro login
        </p>
      </div>
    </div>
  )
}
