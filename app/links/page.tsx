'use client'

import { useState, useEffect } from 'react'

type Link = { id: number; label: string; url: string; active: boolean; position: number }

const icons: Record<string, string> = {
  'Comprar Agora': '🛍️',
  'Site': '🌐',
  'WhatsApp': '💬',
  'TikTok': '🎵',
  'Pinterest': '📌',
  'Instagram': '📸',
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [clicked, setClicked] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/links').then(r => r.json()).then(setLinks)
  }, [])

  async function handleClick(link: Link) {
    setClicked(link.id)
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click', link_id: link.id }),
    })
    setTimeout(() => {
      window.open(link.url, '_blank')
      setClicked(null)
    }, 150)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --creme: #F2EBD9; --navy: #1A2744; --red: #C0281C; --gold: #D4A843; }
        body { background: var(--navy); color: var(--creme); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.04);opacity:.1} }
        .ring { position: absolute; border-radius: 50%; border: 1px solid rgba(212,168,67,.15); animation: pulse-ring 4s ease-in-out infinite; pointer-events: none; }
        .link-btn { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1rem 1.5rem; background: rgba(255,255,255,.04); border: 1px solid rgba(212,168,67,.2); color: var(--creme); text-decoration: none; cursor: pointer; transition: all .25s; border-radius: 4px; font-size: 1rem; font-family: inherit; animation: fadeIn .5s ease forwards; opacity: 0; }
        .link-btn:hover { background: rgba(212,168,67,.1); border-color: var(--gold); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
        .link-btn.active { background: rgba(212,168,67,.15); border-color: var(--gold); transform: scale(.98); }
        .link-btn .icon { font-size: 1.3rem; width: 32px; text-align: center; flex-shrink: 0; }
        .link-btn .label { font-weight: 600; letter-spacing: .5px; }
        .link-btn .arrow { margin-left: auto; opacity: .4; font-size: .9rem; transition: opacity .25s; }
        .link-btn:hover .arrow { opacity: .8; }
      `}</style>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Rings decorativos */}
        {[200, 350, 500].map((size, i) => (
          <div key={size} className="ring" style={{ width: size, height: size, animationDelay: `${i * 1.2}s` }} />
        ))}

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 2 }}>
          {/* Banner */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img
              src="/banner.png"
              alt="Ô bicha!"
              style={{ width: '100%', maxWidth: 400, borderRadius: 6 }}
            />
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {links.map((link, i) => (
              <button
                key={link.id}
                className={`link-btn ${clicked === link.id ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => handleClick(link)}
              >
                <span className="icon">{icons[link.label] || '🔗'}</span>
                <span className="label">{link.label}</span>
                <span className="arrow">↗</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '.75rem', opacity: .25, letterSpacing: '1px' }}>
            © 2026 Ô bicha! · Deboche, amor e resistência 🏳️‍🌈
          </p>
        </div>
      </main>
    </>
  )
}
