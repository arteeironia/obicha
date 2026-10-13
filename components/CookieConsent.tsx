'use client'

import { useState, useEffect } from 'react'
import { getConsent, setConsent } from '@/lib/cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (getConsent() === null) setVisible(true)
  }, [])

  function choose(value: 'accepted' | 'rejected') {
    setConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: 'rgba(15,26,46,.98)', borderTop: '1px solid rgba(212,168,67,.3)',
        backdropFilter: 'blur(8px)', padding: '.65rem 1rem',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', justifyContent: 'space-between' }}>
        <p style={{ color: '#F2EBD9', fontSize: '.85rem', lineHeight: 1.5, flex: '1 1 240px', margin: 0 }}>
          Usamos cookies de análise para melhorar o site. Você escolhe se permite.{' '}
          <a href="/politica-de-privacidade" style={{ color: '#D4A843', textDecoration: 'underline' }}>Privacidade</a>.

        </p>
        <div style={{ display: 'flex', gap: '.6rem', flexShrink: 0 }}>
          <button
            onClick={() => choose('rejected')}
            style={{ padding: '.6rem 1.2rem', background: 'transparent', border: '1px solid rgba(242,235,217,.3)', color: '#F2EBD9', fontFamily: 'var(--font-bebas)', letterSpacing: 1, fontSize: '.85rem', cursor: 'pointer', borderRadius: 2 }}
          >
            SÓ O ESSENCIAL
          </button>
          <button
            onClick={() => choose('accepted')}
            style={{ padding: '.6rem 1.2rem', background: '#C0281C', border: '1px solid #C0281C', color: '#F2EBD9', fontFamily: 'var(--font-bebas)', letterSpacing: 1, fontSize: '.85rem', cursor: 'pointer', borderRadius: 2 }}
          >
            ACEITAR TUDO
          </button>
        </div>
      </div>
    </div>
  )
}
