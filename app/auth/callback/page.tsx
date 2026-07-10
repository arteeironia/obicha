'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const next = new URLSearchParams(window.location.search).get('next') ||
          document.cookie.match(/auth_next=([^;]+)/)?.[1] ||
          '/'
        router.push(next)
      }
    })

    // Processar o hash da URL (token do Supabase)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const next = new URLSearchParams(window.location.search).get('next') || '/'
        router.push(next)
      }
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A2744', color: '#F2EBD9', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🏳️‍🌈</p>
        <p style={{ opacity: .6 }}>Autenticando...</p>
      </div>
    </div>
  )
}
