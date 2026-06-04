'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ParceriasPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: 'parcerias' }),
    })

    if (res.ok) {
      setStatus('success')
      setForm({ name: '', email: '', organization: '', message: '' })
    } else {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '.8rem 1rem',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(212,168,67,.3)',
    color: 'var(--creme)',
    fontFamily: 'inherit',
    fontSize: '.95rem',
    outline: 'none',
    transition: 'border-color .3s',
  }

  return (
    <>
      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --red-deep:#8B1A10; --gold:#D4A843; --sidebar:220px; }
        *, *::before, *::after { box-sizing:border-box; }
        body { margin:0; background:var(--navy); color:var(--creme); font-family:var(--font-dm),sans-serif; }
        .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar); background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2); display:flex; flex-direction:column; z-index:200; }
        .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; }
        .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(242,235,217,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .sidebar-link:hover, .sidebar-link.active { color:var(--gold); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .sidebar-link svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; opacity:.7; }
        .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; transition:all .3s; }
        .sidebar-cta:hover { background:var(--gold); color:var(--navy); }
        .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; max-width:calc(var(--sidebar) + 860px); }
        input:focus, textarea:focus, select:focus { border-color: var(--gold) !important; }
        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/#manifesto" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M3 5h14M3 9h10M3 13h12M3 17h8"/></svg>Manifesto</Link>
          <Link href="/#produtos" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></svg>Produtos</Link>
          <Link href="/#compromissos" className="sidebar-link"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>Missão</Link>
          <Link href="/#amargen" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/></svg>Causa</Link>
          <Link href="/#social" className="sidebar-link"><svg viewBox="0 0 20 20"><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M7 9l6-3M7 11l6 3"/></svg>Redes</Link>
          <Link href="/blog" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg>Blog</Link>
          <Link href="/parcerias" className="sidebar-link active"><svg viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 15a4 4 0 00-8 0v1h8v-1zM18 17v-1a3 3 0 00-2-2.83M4 14.17A3 3 0 002 17v1"/></svg>Parcerias</Link>
          <Link href="/projeto-social" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/><path d="M10 9v4M8 11h4"/></svg>Projeto Social</Link>
        </nav>
        <div className="sidebar-bottom">
          <a href="https://umapenca.com/obicha/" target="_blank" className="sidebar-cta">Entrar na Loja</a>
        </div>
      </aside>

      <main className="main">
        <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Vamos criar juntos ★</span>
        <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,5vw,4rem)', fontWeight:900, lineHeight:1.1, marginBottom:'1.5rem' }}>
          Parcerias que<br /><em style={{ color:'var(--red)' }}>fazem sentido.</em>
        </h1>
        <p style={{ fontSize:'1.05rem', lineHeight:1.9, opacity:.8, maxWidth:600, marginBottom:'3rem' }}>
          A Ô bicha! está aberta para colabs com criadores, influenciadores, lojas multimarca e marcas que compartilham os mesmos valores — deboche, amor e resistência. Se você tem uma ideia, a gente tem ouvidos.
        </p>

        {/* Cards de tipo de parceria */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'3rem' }}>
          {[
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:36,height:36}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M18 14l2 2 4-4"/></svg>, title:'Criadores', desc:'Colabs com artistas, ilustradores e designers' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:36,height:36}}><path d="M17 20h5v-1a4 4 0 00-5-3.87"/><path d="M9 20H4v-1a4 4 0 015-3.87"/><circle cx="12" cy="8" r="4"/><path d="M12 20v-8"/></svg>, title:'Influenciadores', desc:'Divulgação autêntica para públicos alinhados' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:36,height:36}}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, title:'Lojas', desc:'Revenda e multimarca' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:36,height:36}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, title:'Marcas', desc:'Colabs entre marcas com valores em comum' },
          ].map(item => (
            <div key={item.title} style={{ padding:'1.5rem', border:'1px solid rgba(212,168,67,.2)', background:'rgba(255,255,255,.02)', borderRadius:4 }}>
              <span style={{ display:'block', marginBottom:'.8rem' }}>{item.icon}</span>
              <h3 style={{ fontFamily:'var(--font-bebas)', letterSpacing:'2px', color:'var(--gold)', marginBottom:'.3rem' }}>{item.title}</h3>
              <p style={{ fontSize:'.85rem', opacity:.6, lineHeight:1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Formulário */}
        <div style={{ border:'1px solid rgba(212,168,67,.2)', padding:'2.5rem', borderRadius:4, background:'rgba(255,255,255,.02)', maxWidth:640 }}>
          <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'1.8rem', fontWeight:700, color:'var(--gold)', marginBottom:'1.5rem' }}>
            Manda a proposta
          </h2>

          {status === 'success' ? (
            <div style={{ padding:'2rem', textAlign:'center', border:'1px solid rgba(0,200,100,.3)', background:'rgba(0,200,100,.05)', borderRadius:4 }}>
              <p style={{ fontSize:'2rem', marginBottom:'1rem' }}>✦</p>
              <p style={{ fontFamily:'var(--font-playfair)', fontSize:'1.2rem', color:'#4ade80' }}>Proposta recebida!</p>
              <p style={{ opacity:.6, marginTop:'.5rem', fontSize:'.9rem' }}>A gente retorna em breve. Ô bicha!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>Nome *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Seu nome" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>E-mail *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="seu@email.com" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>Empresa / Marca / Perfil</label>
                <input style={inputStyle} value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="Opcional" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>Sua proposta *</label>
                <textarea style={{ ...inputStyle, minHeight:140, resize:'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder="Conta pra gente o que você tem em mente..." />
              </div>

              {status === 'error' && (
                <p style={{ color:'var(--red)', fontSize:'.85rem' }}>Erro ao enviar. Tenta novamente ou manda direto para parcerias@obicha.com.br</p>
              )}

              <button type="submit" disabled={status === 'sending'} style={{ padding:'1rem 2rem', background:'var(--gold)', color:'var(--navy)', fontFamily:'var(--font-bebas)', letterSpacing:'3px', fontSize:'1rem', border:'none', cursor:'pointer', transition:'all .3s' }}>
                {status === 'sending' ? 'Enviando...' : 'Enviar Proposta'}
              </button>

              <p style={{ fontSize:'.75rem', opacity:.4, textAlign:'center' }}>Ou manda direto: <a href="mailto:parcerias@obicha.com.br" style={{ color:'var(--gold)' }}>parcerias@obicha.com.br</a></p>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
