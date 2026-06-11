'use client'

import { useState, useEffect } from 'react'

type Product = { id: number; name: string; category: string; price: string; link: string; image_url: string | null; description: string | null; featured: boolean; collection_name: string | null }
type SocialPost = { id: number; platform: string; url: string }
type PinterestPin = { id: number; image_url: string; pin_url: string | null }
type HImage = { id: number; image_url: string; position: number }
type Highlight = { id: number; type: string; title: string; original_price: string | null; promo_price: string | null; expires_at: string | null; link: string | null; images: HImage[] | null }

interface Props {
  products: Product[]
  socialPosts: SocialPost[]
  pinterestPins: PinterestPin[]
  siteConfig: Record<string, string>
  highlights: Highlight[]
}

const catLabel = (cat: string) => ({
  camisetas: 'Camiseta Algodão', estonada: 'Camiseta Estonada', dryfit: 'Dry Fit',
  modal: 'Modal Tech', canecas: 'Caneca', ecobags: 'Ecobag', bottoms: 'Bottom'
}[cat] || cat)

const platformLabel = (p: string) => ({ instagram: 'INSTAGRAM', tiktok: 'TIKTOK' }[p] || p.toUpperCase())

function getEmbedHTML(post: SocialPost) {
  if (post.platform === 'instagram') {
    const cleanUrl = post.url.split('?')[0].replace(/\/$/, '')
    return `<blockquote class="instagram-media" data-instgrm-permalink="${cleanUrl}/" data-instgrm-version="14" style="width:100%;margin:0;border:none;"></blockquote>`
  }
  if (post.platform === 'tiktok') {
    const videoId = post.url.match(/video\/(\d+)/)?.[1]
    if (videoId) return `<blockquote class="tiktok-embed" cite="${post.url}" data-video-id="${videoId}" style="max-width:100%;min-width:100%;margin:0;"><section></section></blockquote>`
  }
  return `<a href="${post.url}" target="_blank" style="display:flex;align-items:center;justify-content:center;height:300px;color:var(--gold);font-family:var(--font-bebas);letter-spacing:2px;">VER POST ↗</a>`
}

export default function LandingClient({ products, socialPosts, pinterestPins, siteConfig, highlights }: Props) {
  const lojaUrl = siteConfig.loja_url || 'https://umapenca.com/obicha/'
  const instagramUrl = siteConfig.instagram_url || 'https://www.instagram.com/obicha_camisetas/'
  const tiktokUrl = siteConfig.tiktok_url || 'https://www.tiktok.com/@obicha_camisetas'
  const pinterestUrl = siteConfig.pinterest_url || 'https://br.pinterest.com/Obicha_camisetas/'
  const whatsappUrl = siteConfig.whatsapp_url || 'https://wa.me/5519982925769'

  const [activeCategory, setActiveCategory] = useState('todos')
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const categories = ['todos', 'camisetas', 'estonada', 'dryfit', 'modal', 'canecas', 'ecobags', 'bottoms']

  const slides: { image_url: string; title: string; type: string; original_price: string | null; promo_price: string | null; link: string | null }[] = []
  highlights.forEach(h => {
    (h.images || []).forEach(img => {
      slides.push({ image_url: img.image_url, title: h.title, type: h.type, original_price: h.original_price, promo_price: h.promo_price, link: h.link })
    })
  })

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const filteredProducts = activeCategory === 'todos' ? products : products.filter(p => p.category === activeCategory)

  useEffect(() => {
    if (socialPosts.some(p => p.platform === 'instagram')) {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process()
      } else {
        const s = document.createElement('script')
        s.src = 'https://www.instagram.com/embed.js'
        s.async = true
        s.onload = () => { if ((window as any).instgrm) (window as any).instgrm.Embeds.process() }
        document.body.appendChild(s)
      }
    }
    if (socialPosts.some(p => p.platform === 'tiktok')) {
      if (!document.querySelector('script[src*="tiktok.com/embed"]')) {
        const s = document.createElement('script')
        s.src = 'https://www.tiktok.com/embed.js'
        s.async = true
        document.body.appendChild(s)
      }
    }
  }, [socialPosts])

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.15 })
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --red-deep:#8B1A10; --gold:#D4A843; --sidebar:220px; }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; padding:0; overflow-x:hidden; }
        .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar); background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2); display:flex; flex-direction:column; z-index:200; backdrop-filter:blur(12px); }
        .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; }
        .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(242,235,217,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .sidebar-link:hover { color:var(--gold); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .sidebar-link .sl-icon { display:flex; align-items:center; width:20px; flex-shrink:0; opacity:.7; transition:opacity .25s; }
        .sidebar-link:hover .sl-icon { opacity:1; }
        .sidebar-link .sl-icon svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
        .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; border:2px solid var(--red); transition:all .3s; }
        .sidebar-cta:hover { background:var(--gold); border-color:var(--gold); color:var(--navy); }
        .main-content { margin-left:var(--sidebar); }
        .hamburger { display:none; position:fixed; top:1rem; left:1rem; z-index:300; background:rgba(15,26,46,.95); border:1px solid rgba(212,168,67,.3); width:44px; height:44px; align-items:center; justify-content:center; cursor:pointer; flex-direction:column; gap:5px; padding:10px; }
        .hamburger span { display:block; width:22px; height:2px; background:var(--gold); transition:all .3s; }
        .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:199; }
        @media(max-width:900px) { .sidebar { transform:translateX(-100%); transition:transform .3s; } .sidebar.open { transform:translateX(0); } .sidebar-overlay.open { display:block; } .main-content { margin-left:0; } .hamburger { display:flex; } }
        .reveal { opacity:0; transform:translateY(30px); transition:opacity .7s ease,transform .7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.03);opacity:.6} }
        @keyframes banner-glow { from{box-shadow:0 0 80px rgba(192,40,28,.3),0 0 30px rgba(212,168,67,.2)} to{box-shadow:0 0 120px rgba(192,40,28,.5),0 0 60px rgba(212,168,67,.35)} }
        @keyframes hero-in { to{opacity:1;transform:translateY(0)} }
        .hero-content { animation:hero-in 1.2s cubic-bezier(.16,1,.3,1) forwards; opacity:0; transform:translateY(40px); }
        .ring { position:absolute; border-radius:50%; border:1px solid rgba(212,168,67,.15); animation:pulse-ring 4s ease-in-out infinite; }
        .btn-primary { display:inline-block; padding:.9rem 2.5rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); font-size:1.1rem; letter-spacing:3px; text-decoration:none; border:2px solid var(--red); transition:all .3s; }
        .btn-primary:hover { background:var(--gold); border-color:var(--gold); color:var(--navy); }
        .btn-secondary { display:inline-block; padding:.9rem 2.5rem; background:transparent; color:var(--gold); font-family:var(--font-bebas); font-size:1.1rem; letter-spacing:3px; text-decoration:none; border:2px solid var(--gold); transition:all .3s; margin-left:1rem; }
        .btn-secondary:hover { background:var(--gold); color:var(--navy); }
        .diagonal-break { height:80px; position:relative; overflow:hidden; }
        .diagonal-break::after { content:''; position:absolute; bottom:0; left:-5%; right:-5%; height:100%; transform:skewY(-2deg); transform-origin:bottom left; }
        .social-icon-link { width:44px; height:44px; border:1px solid rgba(212,168,67,.3); border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all .3s; text-decoration:none; }
        .social-icon-link:hover { border-color:var(--gold); background:rgba(212,168,67,.1); transform:translateY(-3px); }
        .social-icon-link svg { width:18px; height:18px; fill:rgba(242,235,217,.6); transition:fill .3s; }
        .social-icon-link:hover svg { fill:var(--gold); }
        .product-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; transition:all .4s; }
        .product-card:hover { border-color:var(--gold); transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,.4); }
        .product-card-img-wrap { position:relative; cursor:zoom-in; overflow:hidden; }
        .product-card-img-wrap img { transition:transform .4s ease; }
        .product-card-img-wrap:hover img { transform:scale(1.06); }
        .social-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; transition:all .4s; }
        .social-card:hover { border-color:var(--gold); transform:translateY(-4px); }
        .commitment-card { background:var(--navy); color:var(--creme); padding:2.5rem 2rem; border-radius:4px; border-top:3px solid var(--gold); transition:transform .3s; position:relative; overflow:hidden; }
        .commitment-card::before { content:attr(data-num); position:absolute; top:-.5rem; right:1rem; font-family:var(--font-playfair); font-size:6rem; color:rgba(212,168,67,.06); font-weight:900; line-height:1; }
        .commitment-card:hover { transform:translateY(-4px); }
        .section-divider { display:flex; align-items:center; gap:1rem; justify-content:center; margin:1.5rem 0; }
        .section-divider::before,.section-divider::after { content:''; height:1px; width:80px; }
        .lightbox-overlay { position:fixed; inset:0; background:rgba(0,0,0,.92); z-index:9000; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .3s; }
        .lightbox-overlay.open { opacity:1; pointer-events:all; }
        .lightbox-overlay img { max-width:90vw; max-height:90vh; object-fit:contain; border-radius:4px; }
        .lightbox-close { position:absolute; top:1.5rem; right:2rem; color:rgba(255,255,255,.6); font-size:2rem; cursor:pointer; background:none; border:none; transition:color .3s; line-height:1; }
        .lightbox-close:hover { color:var(--gold); }
        @media(max-width:600px) { .btn-secondary { margin-left:0; margin-top:1rem; display:block; } .amargen-grid { grid-template-columns:1fr!important; } }
      `}</style>

      <div className={`lightbox-overlay ${lightboxImg ? 'open' : ''}`} onClick={() => setLightboxImg(null)}>
        <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
        {lightboxImg && <img src={lightboxImg} alt="Produto" onClick={e => e.stopPropagation()} />}
      </div>

      <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <a href="#hero" onClick={() => setMobileMenuOpen(false)}>
            <img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" />
          </a>
        </div>
        <nav className="sidebar-nav">
          {[['#manifesto','Manifesto'],['#produtos','Produtos'],['#compromissos','Missão'],['#amargen','Causa'],['#social','Redes']].map(([href, label]) => (
            <a key={href} href={href} className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
              <span className="sl-icon">
                <svg viewBox="0 0 20 20">
                  {href === '#manifesto' && <path d="M3 5h14M3 9h10M3 13h12M3 17h8"/>}
                  {href === '#produtos' && <><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></>}
                  {href === '#compromissos' && <><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></>}
                  {href === '#amargen' && <path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/>}
                  {href === '#social' && <><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M7 9l6-3M7 11l6 3"/></>}
                </svg>
              </span>
              {label}
            </a>
          ))}
          <a href="/blog" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="sl-icon"><svg viewBox="0 0 20 20"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg></span>
            Blog
          </a>
          <a href="/parcerias" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="sl-icon"><svg viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 15a4 4 0 00-8 0v1h8v-1zM18 17v-1a3 3 0 00-2-2.83M4 14.17A3 3 0 002 17v1"/></svg></span>
            Parcerias
          </a>
          <a href="/projeto-social" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="sl-icon"><svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/><path d="M10 9v4M8 11h4"/></svg></span>
            Projeto Social
          </a>
        </nav>
        <div className="sidebar-bottom">
          <a href={lojaUrl} target="_blank" className="sidebar-cta">Entrar na Loja</a>
        </div>
      </aside>

      <div className="main-content">

        <section id="hero" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', background:'var(--navy)' }}>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
            {[300,500,700,900,1100].map((size,i) => (
              <div key={size} className="ring" style={{ width:size, height:size, animationDelay:`${i*0.5}s`, borderColor:i%2===1?'rgba(192,40,28,.1)':undefined }} />
            ))}
          </div>
          <div className="hero-content" style={{ position:'relative', zIndex:2, textAlign:'center', padding:'2rem' }}>
            <div style={{ fontFamily:'var(--font-bebas)', letterSpacing:'6px', fontSize:'.9rem', color:'var(--gold)', marginBottom:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
              <span style={{ color:'var(--red)', fontSize:'.7rem' }}>★</span>Camisetas com Orgulho<span style={{ color:'var(--red)', fontSize:'.7rem' }}>★</span>
            </div>
            <img src="/banner.png" alt="Ô bicha!" style={{ maxWidth:'min(680px,88vw)', width:'100%', borderRadius:4, animation:'banner-glow 3s ease-in-out infinite alternate', marginBottom:'2rem' }} />
            <p style={{ fontFamily:'var(--font-playfair)', fontStyle:'italic', fontSize:'clamp(1.2rem,3vw,1.8rem)', color:'var(--creme)', marginBottom:'2.5rem', opacity:.9 }}>
              Desde sempre, <strong style={{ color:'var(--gold)', fontStyle:'normal' }}>um grito de liberdade.</strong>
            </p>
            <a href={lojaUrl} target="_blank" className="btn-primary">Entrar na Loja</a>
            <a href="#manifesto" className="btn-secondary">Nossa História</a>
          </div>
        </section>

        <div className="diagonal-break" style={{ background:'var(--navy)' }}><style>{`.diagonal-break:nth-of-type(1)::after{background:var(--creme)}`}</style></div>
        <section id="manifesto" style={{ background:'var(--creme)', color:'var(--navy)', padding:'6rem 2rem', overflow:'hidden', position:'relative' }}>
          <div style={{ maxWidth:900, margin:'0 auto', position:'relative' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--red)', display:'block', marginBottom:'.5rem' }}>★ Manifesto ★</span>
            <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:900, lineHeight:1, marginBottom:'2rem', color:'var(--navy)' }}>
              Desde sempre,<br /><em style={{ color:'var(--red)' }}>um grito de liberdade.</em>
            </h1>
            <blockquote style={{ fontFamily:'var(--font-playfair)', fontStyle:'italic', fontSize:'1.4rem', color:'var(--red)', borderLeft:'4px solid var(--gold)', paddingLeft:'1.5rem', margin:'2.5rem 0', lineHeight:1.5 }}>
              "Pegamos uma palavra que tentaram usar para nos silenciar — e a transformamos no nosso maior selo de orgulho, autoridade visual e estilo."
            </blockquote>
            <div style={{ fontSize:'1.05rem', lineHeight:1.9, color:'#2a2a2a', maxWidth:700 }}>
              <p>A Ô bicha! não nasceu para passar despercebida. Nós surgimos da urgência de ressignificar. Unimos a estética clássica do design tipográfico, a vibração da Pop Art e a paixão pela cultura geek para criar mais do que roupas e acessórios: criamos <strong>manifestos portáteis.</strong></p>
              <p style={{ marginTop:'1.2rem' }}>Nossas camisetas, ecobags, canecas e bottoms são feitos para quem ocupa as ruas com marra, representatividade e muito deboche fino. Em algodão, estonada, dry fit ou modal tech — sempre com estampa que tem algo a dizer.</p>
            </div>
          </div>
        </section>

        {slides.length > 0 && (
          <section id="destaques" style={{ background:'var(--navy)', padding:'4rem 0 2rem' }}>
            <div style={{ textAlign:'center', marginBottom:'2rem', padding:'0 2rem' }}>
              <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Em Destaque ★</span>
              <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:900, lineHeight:1.1 }}>
                Coleções <em style={{ color:'var(--red)' }}>especiais.</em>
              </h2>
            </div>
            <div style={{ position:'relative', maxWidth:480, margin:'0 auto', padding:'0 2rem' }}>
              <div style={{ overflow:'hidden', borderRadius:4, border:'1px solid rgba(212,168,67,.15)' }}>
                <div style={{ display:'flex', transition:'transform .6s cubic-bezier(.25,.46,.45,.94)', transform:`translateX(-${currentSlide * 100}%)` }}>
                  {slides.map((slide, i) => (
                    <div key={i} style={{ minWidth:'100%' }}>
                      <div style={{ position:'relative', cursor:'zoom-in', overflow:'hidden', aspectRatio:1 }} onClick={() => setLightboxImg(slide.image_url)}>
                        <img src={slide.image_url} alt={slide.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .4s ease' }}
                          onMouseEnter={e => (e.target as HTMLElement).style.transform='scale(1.06)'}
                          onMouseLeave={e => (e.target as HTMLElement).style.transform='scale(1)'}
                        />
                        <span style={{ position:'absolute', top:'.8rem', left:'.8rem', background:'rgba(15,26,46,.9)', border:'1px solid rgba(212,168,67,.3)', padding:'.2rem .7rem', fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'3px', color:slide.type==='promotion'?'var(--red)':'var(--gold)' }}>
                          {slide.type === 'promotion' ? 'PROMOÇÃO' : slide.title.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ padding:'.8rem 1rem', background:'rgba(15,26,46,.95)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
                        <div>
                          {slide.type === 'promotion' && <div style={{ fontFamily:'var(--font-playfair)', fontSize:'.9rem', fontWeight:700, color:'var(--creme)', marginBottom:'.3rem' }}>{slide.title}</div>}
                          {slide.type === 'promotion' && (slide.original_price || slide.promo_price) && (
                            <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                              {slide.original_price && <span style={{ fontSize:'.75rem', color:'rgba(242,235,217,.4)', textDecoration:'line-through' }}>{slide.original_price}</span>}
                              {slide.promo_price && <span style={{ fontFamily:'var(--font-bebas)', fontSize:'1rem', color:'var(--red)', letterSpacing:'1px' }}>{slide.promo_price}</span>}
                            </div>
                          )}
                        </div>
                        {slide.link && <a href={slide.link} target="_blank" style={{ flexShrink:0, padding:'.4rem 1rem', background:'var(--red)', color:'var(--creme)', fontFamily:'var(--font-bebas)', letterSpacing:'1px', fontSize:'.75rem', textDecoration:'none', whiteSpace:'nowrap' }}>Ver na loja</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {slides.length > 1 && (
                <>
                  <button onClick={() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length)} style={{ position:'absolute', top:'40%', left:0, transform:'translateY(-50%)', background:'rgba(26,39,68,.8)', border:'1px solid rgba(212,168,67,.4)', color:'var(--gold)', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'1.1rem', zIndex:2 }}>‹</button>
                  <button onClick={() => setCurrentSlide(s => (s + 1) % slides.length)} style={{ position:'absolute', top:'40%', right:0, transform:'translateY(-50%)', background:'rgba(26,39,68,.8)', border:'1px solid rgba(212,168,67,.4)', color:'var(--gold)', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'1.1rem', zIndex:2 }}>›</button>
                </>
              )}
              {slides.length > 1 && (
                <div style={{ display:'flex', justifyContent:'center', gap:'.4rem', marginTop:'.8rem' }}>
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} style={{ width:6, height:6, borderRadius:'50%', border:'none', cursor:'pointer', padding:0, background: i === currentSlide ? 'var(--gold)' : 'rgba(242,235,217,.25)', transform: i === currentSlide ? 'scale(1.3)' : 'scale(1)', transition:'all .3s' }} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section id="produtos" style={{ background:'var(--navy)', padding:'6rem 2rem' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Coleção ★</span>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1 }}>Vista o <em style={{ color:'var(--gold)' }}>deboche.</em></h2>
            <div className="section-divider"><span style={{ color:'var(--gold)' }}>✦</span></div>
            <p style={{ opacity:.6, fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>Camisetas · Canecas · Ecobags · Bottoms</p>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:'.5rem', marginBottom:'3rem', flexWrap:'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding:'.5rem 1.5rem', border:'1px solid', borderColor:activeCategory===cat?'var(--gold)':'rgba(212,168,67,.4)', background:activeCategory===cat?'var(--gold)':'transparent', color:activeCategory===cat?'var(--navy)':'var(--creme)', fontFamily:'var(--font-bebas)', letterSpacing:'2px', fontSize:'.9rem', cursor:'pointer', transition:'all .3s', borderRadius:2 }}>
                {cat === 'todos' ? 'Todos' : catLabel(cat)}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'2rem', maxWidth:1200, margin:'0 auto' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', opacity:.3, padding:'4rem' }}>
                <p style={{ fontSize:'3rem' }}>👕</p>
                <p style={{ marginTop:'1rem' }}>Produtos em breve</p>
              </div>
            ) : filteredProducts.map(p => (
              <div key={p.id} className="product-card">
                {p.image_url
                  ? <div className="product-card-img-wrap" onClick={() => setLightboxImg(p.image_url!)}><img src={p.image_url} alt={p.name} style={{ width:'100%', aspectRatio:1, objectFit:'cover', display:'block' }} /></div>
                  : <div style={{ width:'100%', aspectRatio:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.05)', gap:'.5rem' }}><span style={{ fontSize:'3rem', opacity:.3 }}>👕</span></div>
                }
                <div style={{ padding:'1.2rem' }}>
                  <div style={{ fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'3px', color:'var(--gold)', marginBottom:'.3rem' }}>{catLabel(p.category)}</div>
                  <div style={{ fontFamily:'var(--font-playfair)', fontSize:'1.05rem', fontWeight:700, marginBottom:'.8rem', lineHeight:1.3 }}>{p.name}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'.85rem', color:'rgba(242,235,217,.6)' }}>{p.price}</span>
                    <a href={p.link} target="_blank" style={{ padding:'.4rem 1rem', background:'var(--red)', color:'var(--creme)', fontFamily:'var(--font-bebas)', letterSpacing:'1px', fontSize:'.8rem', textDecoration:'none', transition:'background .3s', borderRadius:2 }}
                      onMouseEnter={e => (e.target as HTMLElement).style.background='var(--gold)'}
                      onMouseLeave={e => (e.target as HTMLElement).style.background='var(--red)'}
                    >Ver na loja</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="compromissos" style={{ background:'var(--creme)', color:'var(--navy)', padding:'6rem 2rem' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
              <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--red)', display:'block', marginBottom:'.5rem' }}>★ Nossa Missão ★</span>
              <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1, color:'var(--navy)' }}>Moda <em style={{ color:'var(--red)' }}>consciente</em><br />de verdade.</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'2rem' }}>
              {[
                { num:'01', icon:<CommitmentIcon1/>, title:'100% Algodão Sustentável', desc:'Fibra natural de alta qualidade. Toque macio, caimento perfeito e durabilidade que resiste à moda descartável.' },
                { num:'02', icon:<CommitmentIcon2/>, title:'Selo PETA Cruelty Free', desc:'Orgulhosamente vegana. Nenhum componente ou etapa da nossa produção envolve qualquer crueldade animal.' },
                { num:'03', icon:<CommitmentIcon3/>, title:'Impressão DTG Premium', desc:'Estampas fundidas diretamente no tecido. Cores vibrantes, alta definição e toque zero — sem camada plástica.' },
                { num:'04', icon:<CommitmentIcon4/>, title:'Impacto Social Real', desc:'Parte de cada venda vai direto ao Instituto Amargen. Você não compra só uma peça — você financia transformação.' },
              ].map(item => (
                <div key={item.num} className="commitment-card reveal" data-num={item.num}>
                  <span style={{ display:'block', marginBottom:'1.2rem' }}>{item.icon}</span>
                  <h3 style={{ fontFamily:'var(--font-playfair)', fontSize:'1.2rem', fontWeight:700, marginBottom:'.8rem', color:'var(--gold)' }}>{item.title}</h3>
                  <p style={{ fontSize:'.9rem', lineHeight:1.7, opacity:.85 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="amargen" style={{ background:'var(--red-deep)', padding:'6rem 2rem', position:'relative', overflow:'hidden' }}>
          <div className="amargen-grid reveal" style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
            <div>
              <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'rgba(242,235,217,.7)', display:'block', marginBottom:'.5rem' }}>★ Nossa Causa ★</span>
              <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, lineHeight:1.1, marginBottom:'1.5rem' }}>Cada compra<br /><em style={{ color:'var(--gold)' }}>transforma vidas.</em></h2>
              <p style={{ fontSize:'.95rem', lineHeight:1.9, opacity:.85, marginBottom:'1rem' }}>A Ô bicha! destina parte do valor de toda compra diretamente ao <strong>Instituto Amargen</strong>.</p>
              <p style={{ fontSize:'.95rem', lineHeight:1.9, opacity:.85 }}>Você está vestindo sua identidade, consumindo de forma sustentável e ajudando a financiar uma rede de apoio que gera impacto real.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2rem', textAlign:'center' }}>
              <img src="https://i0.wp.com/institutoamargen.com.br/wp-content/uploads/2020/08/logo-inst.png?fit=800%2C240&ssl=1" alt="Instituto Amargen" style={{ maxWidth:260, filter:'brightness(0) invert(1)', opacity:.9 }} />
              <p style={{ fontFamily:'var(--font-playfair)', fontStyle:'italic', fontSize:'1.2rem', color:'var(--gold)', lineHeight:1.5 }}>"Amar gente é o nosso compromisso."</p>
              <a href="https://institutoamargen.com.br" target="_blank" style={{ padding:'.8rem 2rem', border:'2px solid var(--creme)', color:'var(--creme)', fontFamily:'var(--font-bebas)', letterSpacing:'2px', fontSize:'.9rem', textDecoration:'none', transition:'all .3s' }}
                onMouseEnter={e => { const el=e.target as HTMLElement; el.style.background='var(--creme)'; el.style.color='var(--red-deep)' }}
                onMouseLeave={e => { const el=e.target as HTMLElement; el.style.background='transparent'; el.style.color='var(--creme)' }}
              >Conhecer o Instituto ↗</a>
            </div>
          </div>
        </section>

        <section id="social" style={{ background:'var(--navy)', padding:'6rem 2rem' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Siga a gente ★</span>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1 }}>A gente vive <em style={{ color:'var(--gold)' }}>nas redes.</em></h2>
            <div className="section-divider"><span style={{ color:'var(--gold)' }}>✦</span></div>
            <p style={{ opacity:.6, fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>Instagram · TikTok · Pinterest</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.5rem', maxWidth:1200, margin:'0 auto' }}>
            {socialPosts.map(post => (
              <div key={post.id} className="social-card" style={{ position:'relative' }}>
                <span style={{ position:'absolute', top:'.8rem', left:'.8rem', background:'rgba(26,39,68,.9)', border:'1px solid rgba(212,168,67,.3)', borderRadius:2, padding:'.2rem .6rem', fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'2px', color:'var(--gold)', zIndex:2 }}>{platformLabel(post.platform)}</span>
                <div dangerouslySetInnerHTML={{ __html: getEmbedHTML(post) }} />
              </div>
            ))}
            {pinterestPins.map(pin => (
              <div key={pin.id} className="social-card" style={{ position:'relative' }}>
                <span style={{ position:'absolute', top:'.8rem', left:'.8rem', background:'rgba(26,39,68,.9)', border:'1px solid rgba(212,168,67,.3)', borderRadius:2, padding:'.2rem .6rem', fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'2px', color:'var(--gold)', zIndex:2 }}>PINTEREST</span>
                <a href={pin.pin_url || pinterestUrl} target="_blank" style={{ display:'block' }}>
                  <img src={pin.image_url} alt="Pin Pinterest" style={{ width:'100%', aspectRatio:1, objectFit:'cover', display:'block' }} />
                </a>
              </div>
            ))}
            {socialPosts.length === 0 && pinterestPins.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', opacity:.3, padding:'4rem' }}><p style={{ fontSize:'3rem' }}>📱</p><p style={{ marginTop:'1rem' }}>Posts em breve</p></div>
            )}
          </div>
        </section>

        <section style={{ background:'var(--navy)', padding:'8rem 2rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', fontFamily:'var(--font-bebas)', fontSize:'clamp(6rem,20vw,16rem)', color:'rgba(212,168,67,.04)', letterSpacing:'5px', whiteSpace:'nowrap', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', lineHeight:1 }}>ÔBICHA</div>
          <div className="reveal" style={{ position:'relative', zIndex:2 }}>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:900, lineHeight:1.1, marginBottom:'1rem' }}>
              Vista o deboche.<br /><em style={{ color:'var(--red)' }}>Espalhe o amor.</em><br /><strong style={{ color:'var(--gold)' }}>Carregue a resistência.</strong>
            </h2>
            <p style={{ fontSize:'1.1rem', opacity:.7, marginBottom:'3rem', fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>Deboche, amor e resistência. Feito no Brasil.</p>
            <a href={lojaUrl} target="_blank" className="btn-primary" style={{ fontSize:'1.3rem', padding:'1.2rem 4rem' }}>Entrar na Loja</a>
          </div>
        </section>

        <footer style={{ background:'#0f1a2e', borderTop:'1px solid rgba(212,168,67,.2)', padding:'3rem 2rem', textAlign:'center' }}>
          <span style={{ fontFamily:'var(--font-bebas)', fontSize:'2.5rem', color:'var(--gold)', letterSpacing:'3px', display:'block', marginBottom:'1rem' }}>Ô<span style={{ color:'var(--red)' }}>bicha</span>!</span>
          <p style={{ fontFamily:'var(--font-playfair)', fontStyle:'italic', fontSize:'.9rem', color:'rgba(242,235,217,.5)', marginBottom:'2rem' }}>Deboche, amor e resistência. Feito no Brasil.</p>
          <div style={{ display:'flex', justifyContent:'center', gap:'1.5rem', marginBottom:'2rem' }}>
            <a href={instagramUrl} target="_blank" className="social-icon-link" title="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href={tiktokUrl} target="_blank" className="social-icon-link" title="TikTok"><svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg></a>
            <a href={pinterestUrl} target="_blank" className="social-icon-link" title="Pinterest"><svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
            <a href={whatsappUrl} target="_blank" className="social-icon-link" title="WhatsApp"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></a>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:'2rem', flexWrap:'wrap', marginBottom:'2rem' }}>
            {[['#manifesto','Manifesto'],['#produtos','Produtos'],['#compromissos','Missão'],['#amargen','Causa'],['#social','Redes']].map(([href,label]) => (
              <a key={href} href={href} style={{ color:'rgba(242,235,217,.5)', textDecoration:'none', fontSize:'.8rem', letterSpacing:'1px', textTransform:'uppercase', transition:'color .3s' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.5)'}>{label}</a>
            ))}
            <a href={lojaUrl} target="_blank" style={{ color:'rgba(242,235,217,.5)', textDecoration:'none', fontSize:'.8rem', letterSpacing:'1px', textTransform:'uppercase', transition:'color .3s' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.5)'}>Loja</a>
            <a href="https://institutoamargen.com.br" target="_blank" style={{ color:'rgba(242,235,217,.5)', textDecoration:'none', fontSize:'.8rem', letterSpacing:'1px', textTransform:'uppercase', transition:'color .3s' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.5)'}>Instituto Amargen</a>
          </div>
          <p style={{ fontSize:'.75rem', color:'rgba(242,235,217,.3)', marginBottom:'.8rem' }}>© 2026 Ô bicha! · Todos os direitos reservados · Feito com orgulho 🏳️‍🌈</p>
          <p style={{ fontSize:'.72rem', color:'rgba(242,235,217,.2)', marginBottom:'.8rem' }}>Fernando Carsi · CPF: 037.028.966-86 · Campinas/SP · Não temos loja física</p>
          <div style={{ display:'flex', justifyContent:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            <a href="mailto:faleconosco@obicha.com.br" style={{ fontSize:'.72rem', color:'rgba(242,235,217,.3)', textDecoration:'none' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.3)'}>Fale Conosco</a>
            <span style={{ color:'rgba(242,235,217,.15)' }}>·</span>
            <a href="https://umapenca.com/obicha/central-de-ajuda/#reamaze#0#/kb/trocas-e-devolucoes/" target="_blank" style={{ fontSize:'.72rem', color:'rgba(242,235,217,.3)', textDecoration:'none' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.3)'}>Trocas e Devoluções</a>
            <span style={{ color:'rgba(242,235,217,.15)' }}>·</span>
            <a href="/parcerias" style={{ fontSize:'.72rem', color:'rgba(242,235,217,.3)', textDecoration:'none' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.3)'}>Parcerias</a>
            <span style={{ color:'rgba(242,235,217,.15)' }}>·</span>
            <a href="/projeto-social" style={{ fontSize:'.72rem', color:'rgba(242,235,217,.3)', textDecoration:'none' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.3)'}>Projeto Social</a>
          </div>
        </footer>
      </div>
    </>
  )
}

function CommitmentIcon1() {
  return <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ width:56,height:56,stroke:'var(--gold)',fill:'none',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round',filter:'drop-shadow(0 0 6px rgba(212,168,67,.35))' }}>
    <line x1="28" y1="50" x2="28" y2="28"/><path d="M28 46 Q20 48 16 44"/><path d="M28 44 Q36 46 40 42"/>
    <circle cx="28" cy="20" r="8"/><path d="M28 12 Q24 8 20 10 Q22 16 28 16"/><path d="M28 12 Q32 8 36 10 Q34 16 28 16"/>
    <path d="M20 20 Q16 16 14 20 Q18 24 24 22"/><path d="M36 20 Q40 16 42 20 Q38 24 32 22"/>
    <path d="M23 18 Q28 15 33 18" strokeWidth="1"/><path d="M22 21 Q28 19 34 21" strokeWidth="1"/>
  </svg>
}
function CommitmentIcon2() {
  return <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ width:56,height:56,stroke:'var(--gold)',fill:'none',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round',filter:'drop-shadow(0 0 6px rgba(212,168,67,.35))' }}>
    <ellipse cx="28" cy="34" rx="10" ry="8"/><path d="M20 34 Q28 30 36 34" strokeWidth="1"/><path d="M21 37 Q28 34 35 37" strokeWidth="1"/>
    <ellipse cx="16" cy="23" rx="4" ry="5" transform="rotate(-15 16 23)"/><ellipse cx="24" cy="18" rx="4" ry="5" transform="rotate(-5 24 18)"/>
    <ellipse cx="32" cy="18" rx="4" ry="5" transform="rotate(5 32 18)"/><ellipse cx="40" cy="23" rx="4" ry="5" transform="rotate(15 40 23)"/>
    <path d="M14 19 Q12 16 13 14" strokeWidth="1.2"/><path d="M22 15 Q21 12 22 10" strokeWidth="1.2"/>
    <path d="M34 15 Q35 12 34 10" strokeWidth="1.2"/><path d="M42 19 Q44 16 43 14" strokeWidth="1.2"/>
  </svg>
}
function CommitmentIcon3() {
  return <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ width:56,height:56,stroke:'var(--gold)',fill:'none',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round',filter:'drop-shadow(0 0 6px rgba(212,168,67,.35))' }}>
    <path d="M18 16 L8 22 L14 26 L14 48 L42 48 L42 26 L48 22 L38 16"/><path d="M18 16 Q22 12 28 13 Q34 12 38 16"/>
    <line x1="28" y1="32" x2="28" y2="22" strokeWidth="1.2" strokeDasharray="2,2"/>
    <line x1="28" y1="32" x2="22" y2="36" strokeWidth="1.2" strokeDasharray="2,2"/>
    <line x1="28" y1="32" x2="34" y2="36" strokeWidth="1.2" strokeDasharray="2,2"/>
    <circle cx="28" cy="32" r="3" strokeWidth="1.5"/>
    <path d="M16 30 Q20 28 24 30" strokeWidth="0.8"/><path d="M32 30 Q36 28 40 30" strokeWidth="0.8"/>
    <path d="M28 4 L29.5 8.5 L34 8.5 L30.5 11 L32 15.5 L28 13 L24 15.5 L25.5 11 L22 8.5 L26.5 8.5 Z" strokeWidth="1.2"/>
  </svg>
}
function CommitmentIcon4() {
  return <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ width:56,height:56,stroke:'var(--gold)',fill:'none',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round',filter:'drop-shadow(0 0 6px rgba(212,168,67,.35))' }}>
    <line x1="28" y1="4" x2="28" y2="9" strokeWidth="1.5"/><line x1="44" y1="8" x2="41" y2="12" strokeWidth="1.5"/>
    <line x1="50" y1="24" x2="45" y2="25" strokeWidth="1.5"/><line x1="44" y1="44" x2="41" y2="41" strokeWidth="1.5"/>
    <line x1="12" y1="8" x2="15" y2="12" strokeWidth="1.5"/><line x1="6" y1="24" x2="11" y2="25" strokeWidth="1.5"/>
    <line x1="12" y1="44" x2="15" y2="41" strokeWidth="1.5"/>
    <path d="M28 44 Q14 34 14 24 Q14 16 21 14 Q25 13 28 17 Q31 13 35 14 Q42 16 42 24 Q42 34 28 44 Z" strokeWidth="2"/>
    <path d="M20 22 Q24 19 28 22" strokeWidth="1"/><path d="M20 26 Q24 23 28 26" strokeWidth="1"/>
    <text x="28" y="32" textAnchor="middle" fontSize="9" fontFamily="serif" fill="none" stroke="var(--gold)" strokeWidth="0.8">R$</text>
  </svg>
}
