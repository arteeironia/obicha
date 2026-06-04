'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProjetoSocialPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: 'projetosocial' }),
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
        .main { margin-left:var(--sidebar); min-height:100vh; }
        input:focus, textarea:focus { border-color: var(--gold) !important; }
        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; } }
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
          <Link href="/parcerias" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 15a4 4 0 00-8 0v1h8v-1zM18 17v-1a3 3 0 00-2-2.83M4 14.17A3 3 0 002 17v1"/></svg>Parcerias</Link>
          <Link href="/projeto-social" className="sidebar-link active"><svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/><path d="M10 9v4M8 11h4"/></svg>Projeto Social</Link>
        </nav>
        <div className="sidebar-bottom">
          <a href="https://umapenca.com/obicha/" target="_blank" className="sidebar-cta">Entrar na Loja</a>
        </div>
      </aside>

      <main className="main">
        {/* Hero */}
        <div style={{ background:'var(--red)', padding:'6rem 4rem 5rem', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', fontSize:'20rem', color:'rgba(255,255,255,.03)', fontFamily:'var(--font-playfair)', top:'-3rem', right:'-2rem', lineHeight:1, pointerEvents:'none' }}>🏳️‍🌈</div>
          <div style={{ maxWidth:700, position:'relative' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'rgba(242,235,217,.7)', display:'block', marginBottom:'.5rem' }}>★ Resistência que transforma ★</span>
            <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,5vw,4.5rem)', fontWeight:900, lineHeight:1.1, marginBottom:'1.5rem', color:'var(--creme)' }}>
              Moda que<br /><em style={{ color:'var(--gold)' }}>financia a luta.</em>
            </h1>
            <p style={{ fontSize:'1.1rem', lineHeight:1.9, color:'rgba(242,235,217,.85)', maxWidth:580 }}>
              A Ô bicha! acredita que moda e resistência andam juntas. Por isso, parte de cada venda vai direto para grupos e organizações LGBTQ+ que fazem a diferença na vida real — na rua, na periferia, no acolhimento de quem mais precisa.
            </p>
          </div>
        </div>

        <div style={{ padding:'5rem 4rem', maxWidth:'calc(var(--sidebar) + 860px)' }}>
          {/* Como funciona */}
          <div style={{ marginBottom:'4rem' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Como funciona ★</span>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.8rem,3vw,2.5rem)', fontWeight:900, marginBottom:'2rem' }}>
              Simples, transparente e direto.
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem' }}>
              {[
                { num:'01', title:'Você compra', desc:'Qualquer produto da Ô bicha! já inclui uma parte destinada à causa.' },
                { num:'02', title:'A gente separa', desc:'Um percentual de cada venda é reservado para os grupos parceiros.' },
                { num:'03', title:'Vai direto', desc:'O repasse vai diretamente para a organização, sem intermediários.' },
                { num:'04', title:'A gente conta', desc:'Publicamos aqui e no blog como o dinheiro foi usado.' },
              ].map(item => (
                <div key={item.num} style={{ padding:'1.5rem', border:'1px solid rgba(212,168,67,.2)', background:'rgba(255,255,255,.02)', borderRadius:4, borderTop:'3px solid var(--gold)', position:'relative', overflow:'hidden' }}>
                  <span style={{ position:'absolute', top:'-1rem', right:'1rem', fontFamily:'var(--font-playfair)', fontSize:'5rem', color:'rgba(212,168,67,.06)', fontWeight:900, lineHeight:1 }}>{item.num}</span>
                  <h3 style={{ fontFamily:'var(--font-bebas)', letterSpacing:'2px', color:'var(--gold)', marginBottom:'.5rem', fontSize:'1.1rem' }}>{item.title}</h3>
                  <p style={{ fontSize:'.88rem', opacity:.7, lineHeight:1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quem pode se candidatar */}
          <div style={{ marginBottom:'4rem', padding:'2.5rem', background:'rgba(192,40,28,.08)', border:'1px solid rgba(192,40,28,.2)', borderRadius:4 }}>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'1.8rem', fontWeight:900, color:'var(--gold)', marginBottom:'1rem' }}>
              Quem pode ser parceiro?
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
              {[
                'Grupos de apoio LGBTQ+',
                'Casas de acolhimento',
                'Projetos de educação e cultura',
                'Saúde e assistência social',
                'Coletivos de periferia',
                'Projetos de arte e cultura queer',
              ].map(item => (
                <div key={item} style={{ padding:'1rem', background:'rgba(255,255,255,.03)', borderRadius:4, fontSize:'.9rem', opacity:.85, display:'flex', alignItems:'center', gap:'.6rem' }}>
                  <span style={{ color:'var(--gold)', fontSize:'1rem', flexShrink:0 }}>★</span>{item}
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div style={{ border:'1px solid rgba(212,168,67,.2)', padding:'2.5rem', borderRadius:4, background:'rgba(255,255,255,.02)', maxWidth:640 }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Entre em contato ★</span>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'1.8rem', fontWeight:700, marginBottom:'.8rem' }}>
              Sua organização quer ser parceira?
            </h2>
            <p style={{ opacity:.6, fontSize:'.9rem', marginBottom:'2rem', lineHeight:1.7 }}>
              Conta pra gente quem vocês são, o que fazem e como a Ô bicha! pode ajudar. A gente lê tudo e responde.
            </p>

            {status === 'success' ? (
              <div style={{ padding:'2rem', textAlign:'center', border:'1px solid rgba(0,200,100,.3)', background:'rgba(0,200,100,.05)', borderRadius:4 }}>
                <p style={{ fontSize:'2rem', marginBottom:'1rem' }}>✦</p>
                <p style={{ fontFamily:'var(--font-playfair)', fontSize:'1.2rem', color:'#4ade80' }}>Mensagem recebida!</p>
                <p style={{ opacity:.6, marginTop:'.5rem', fontSize:'.9rem' }}>A gente lê e responde em breve. Com amor e deboche.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>Seu nome *</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Nome do responsável" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>E-mail *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="contato@suaorganizacao.org" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>Nome da organização *</label>
                  <input style={inputStyle} value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} required placeholder="Nome do grupo ou organização" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', letterSpacing:'2px', textTransform:'uppercase', opacity:.6, marginBottom:'.4rem' }}>Conta pra gente *</label>
                  <textarea style={{ ...inputStyle, minHeight:160, resize:'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder="O que vocês fazem, quantas pessoas atendem, onde atuam e como a Ô bicha! pode apoiar..." />
                </div>

                {status === 'error' && (
                  <p style={{ color:'var(--red)', fontSize:'.85rem' }}>Erro ao enviar. Tenta novamente ou manda direto para projetosocial@obicha.com.br</p>
                )}

                <button type="submit" disabled={status === 'sending'} style={{ padding:'1rem 2rem', background:'var(--red)', color:'var(--creme)', fontFamily:'var(--font-bebas)', letterSpacing:'3px', fontSize:'1rem', border:'none', cursor:'pointer', transition:'all .3s' }}>
                  {status === 'sending' ? 'Enviando...' : 'Quero ser parceiro'}
                </button>

                <p style={{ fontSize:'.75rem', opacity:.4, textAlign:'center' }}>Ou manda direto: <a href="mailto:projetosocial@obicha.com.br" style={{ color:'var(--gold)' }}>projetosocial@obicha.com.br</a></p>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
