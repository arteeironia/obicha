'use client'

import { useState, useEffect } from 'react'

type Link = { id: number; label: string; url: string; active: boolean; position: number }

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

  function getIcon(label: string) {
    const l = label.toLowerCase()
    if (l.includes('instagram')) return (
      <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'rgba(242,235,217,.6)' }}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
    if (l.includes('tiktok')) return (
      <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'rgba(242,235,217,.6)' }}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    )
    if (l.includes('pinterest')) return (
      <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'rgba(242,235,217,.6)' }}>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    )
    if (l.includes('whatsapp')) return (
      <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'rgba(242,235,217,.6)' }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    )
    if (l.includes('comprar') || l.includes('loja')) return (
      <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'none', stroke:'rgba(242,235,217,.6)', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' }}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    )
    // Site / padrão
    return (
      <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'none', stroke:'rgba(242,235,217,.6)', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' }}>
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --creme: #F2EBD9; --navy: #1A2744; --red: #C0281C; --gold: #D4A843; }
        body { background: var(--navy); color: var(--creme); font-family: var(--font-dm, 'DM Sans', sans-serif); min-height: 100vh; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.15} 50%{transform:scale(1.04);opacity:.06} }
        .ring { position: absolute; border-radius: 50%; border: 1px solid rgba(212,168,67,.15); animation: pulse-ring 4s ease-in-out infinite; pointer-events: none; }
        .link-btn {
          display: flex; align-items: center; gap: 1rem;
          width: 100%; padding: .95rem 1.4rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(212,168,67,.2);
          color: var(--creme); text-decoration: none; cursor: pointer;
          transition: all .25s; border-radius: 4px;
          font-size: .95rem; font-family: inherit;
          animation: fadeIn .5s ease forwards; opacity: 0;
        }
        .link-btn:hover { background: rgba(212,168,67,.1); border-color: var(--gold); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
        .link-btn:hover .btn-icon svg { fill: var(--gold); stroke: var(--gold); }
        .link-btn.active { background: rgba(212,168,67,.12); border-color: var(--gold); transform: scale(.98); }
        .link-btn .btn-icon { width: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .25s; }
        .link-btn .btn-label { font-family: var(--font-bebas, 'Bebas Neue', sans-serif); font-size: 1rem; letter-spacing: 2px; text-transform: uppercase; }
        .link-btn .btn-arrow { margin-left: auto; opacity: .3; font-size: .85rem; transition: opacity .25s; }
        .link-btn:hover .btn-arrow { opacity: .7; }
      `}</style>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {[250, 420, 600].map((size, i) => (
          <div key={size} className="ring" style={{ width: size, height: size, animationDelay: `${i * 1.3}s` }} />
        ))}

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
          {/* Banner */}
          <div style={{ marginBottom: '2rem' }}>
            <img
              src="/banner.png"
              alt="Ô bicha!"
              style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
            {links.map((link, i) => (
              <button
                key={link.id}
                className={`link-btn ${clicked === link.id ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => handleClick(link)}
              >
                <span className="btn-icon">{getIcon(link.label)}</span>
                <span className="btn-label">{link.label}</span>
                <span className="btn-arrow">↗</span>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '.7rem', opacity: .2, letterSpacing: '1px', fontFamily: 'var(--font-bebas, sans-serif)' }}>
            © 2026 Ô bicha! · Deboche, amor e resistência 🏳️‍🌈
          </p>
        </div>
      </main>
    </>
  )
}
