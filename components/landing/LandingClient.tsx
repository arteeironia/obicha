'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { sendEvent } from '@/lib/analytics-client'

type Product = { id: number; name: string; category: string; price: string; link: string; image_url: string | null; description: string | null; featured: boolean; collection_name: string | null; supplier: string | null; slug?: string | null; collections?: { id: number; name: string; slug: string }[]; manual_variants?: any }
type Category = { id: number; value: string; label: string; active: boolean }
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
  categories: Category[]
}

const ABOUT_LINKS: [string, string][] = [
  ['#manifesto', 'Manifesto'], ['#compromissos', 'Nossa Missão'], ['#amargen', 'Nossa Causa'],
  ['/projeto-social', 'Projeto Social'], ['/parcerias', 'Parcerias'], ['/blog', 'Blog'],
  ['/respira', 'Respira'], ['/quiz', 'Quiz'], ['#social', 'Redes sociais'],
]

// "R$ 114,90" -> 114.9 (NaN se não houver preço legível)
function priceNum(s?: string | null) {
  if (!s) return NaN
  return parseFloat(String(s).replace(/[^\d,]/g, '').replace(',', '.'))
}

function supplierLabel(s?: string | null) {
  if (!s) return null
  if (/penca/i.test(s)) return 'Uma Penca'
  if (/reserva/i.test(s)) return 'Reserva Ink'
  return null
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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

function trackProductClick(label: string, meta?: { collection?: string; supplier?: string; position?: string }) {
  sendEvent('product_click', { path: typeof window !== 'undefined' ? window.location.pathname : '/', label: label.slice(0, 200), meta })
}

const VARIANT_SUPPLIER_MAP: Record<string, string> = {
  'Camiseta': 'reserva-ink', 'Regata': 'reserva-ink', 'Cropped': 'reserva-ink', 'Cropped Moletom': 'reserva-ink',
  'Camiseta Oversized': 'reserva-ink', 'Camiseta Algodão Peruano': 'reserva-ink', 'Camiseta Infantil': 'reserva-ink',
  'Hoodie Moletom': 'reserva-ink', 'Suéter Moletom': 'reserva-ink',
  'Dry Fit': 'uma-penca', 'Ecobag': 'uma-penca', 'Caneca': 'uma-penca', 'Kit de Bottons': 'uma-penca',
}

export default function LandingClient({ products, socialPosts, pinterestPins, siteConfig, highlights, categories }: Props) {
  const instagramUrl = siteConfig.instagram_url || 'https://www.instagram.com/obicha_camisetas/'
  const tiktokUrl = siteConfig.tiktok_url || 'https://www.tiktok.com/@obicha_camisetas'
  const pinterestUrl = siteConfig.pinterest_url || 'https://br.pinterest.com/Obicha_camisetas/'
  const whatsappUrl = siteConfig.whatsapp_url || 'https://wa.me/5519982925769'

  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [colOpen, setColOpen] = useState(false)
  const [active, setActive] = useState('hero')

  // Ordem previsível: destacados pelo administrador primeiro; depois o restante na ordem do catálogo
  // (sort estável — não há dado confiável de "lançamento", então não se inventa essa categoria)
  const displayProducts = useMemo(
    () => [...products].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    [products]
  )

  // Coleções existentes (somente as que têm produtos), para o menu e a faixa do celular
  const collectionList = useMemo(() => {
    const m = new Map<number, { id: number; name: string; slug: string }>()
    products.forEach(p => (p.collections || []).forEach(c => { if (c.slug && !m.has(c.id)) m.set(c.id, c) }))
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [products])

  const catLabel = (cat: string) => categories.find(c => c.value === cat)?.label || cat

  const filteredProducts = displayProducts.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

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

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal:not(.no-observe)')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Destaque discreto da seção ativa no menu
  useEffect(() => {
    const ids = ['hero', 'destaques', 'colecoes', 'produtos', 'manifesto', 'compromissos', 'amargen', 'social']
    const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id === 'colecoes' ? 'produtos' : e.target.id) })
    }, { rootMargin: '-25% 0px -65% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  function openSearch() {
    setMenuOpen(false)
    const el = document.getElementById('busca-produtos') as HTMLInputElement | null
    if (!el) return
    const reduce = prefersReducedMotion()
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    window.setTimeout(() => el.focus({ preventScroll: true }), reduce ? 0 : 450)
  }

  return (
    <>
      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --red-deep:#8B1A10; --gold:#D4A843; }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; padding:0; overflow-x:hidden; }
        .main-content { min-width:0; }
        section[id], #colecoes { scroll-margin-top:72px; }
        .topbar { position:sticky; top:0; z-index:200; height:64px; display:flex; align-items:center; gap:2rem; padding:0 clamp(1rem,3vw,2.5rem); background:rgba(15,26,46,.97); border-bottom:1px solid rgba(212,168,67,.2); backdrop-filter:blur(12px); }
        .topbar-logo { display:flex; align-items:center; flex-shrink:0; }
        .topbar-logo img { height:38px; width:auto; display:block; }
        .topnav { display:flex; align-items:center; gap:.4rem; margin-left:auto; }
        .topnav-link { position:relative; display:inline-flex; align-items:center; gap:.4rem; padding:.5rem .9rem; background:none; border:none; cursor:pointer; color:rgba(242,235,217,.65); text-decoration:none; font-family:var(--font-bebas); font-size:1rem; letter-spacing:2.5px; text-transform:uppercase; transition:color .25s; }
        .topnav-link::after { content:''; position:absolute; left:.9rem; right:.9rem; bottom:.15rem; height:2px; background:var(--gold); transform:scaleX(0); transition:transform .25s; }
        .topnav-link:hover, .topnav-link.active, .topnav-link[aria-expanded="true"] { color:var(--gold); }
        .topnav-link.active::after, .topnav-link:hover::after { transform:scaleX(1); }
        .topnav-link svg { width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
        .topnav-menu { position:relative; }
        .topnav-panel { position:absolute; top:calc(100% + 4px); right:0; min-width:240px; max-height:70vh; overflow-y:auto; padding:.5rem 0; background:rgba(15,26,46,.99); border:1px solid rgba(212,168,67,.3); box-shadow:0 16px 32px rgba(0,0,0,.45); z-index:250; }
        .topnav-panel a { display:block; padding:.65rem 1.4rem; color:rgba(242,235,217,.75); text-decoration:none; font-family:var(--font-dm); font-size:.9rem; transition:background .2s,color .2s; }
        .topnav-panel a:hover { background:rgba(212,168,67,.08); color:var(--gold); }
        .topnav-panel hr { border:none; border-top:1px solid rgba(212,168,67,.15); margin:.4rem 0; }
        .topbar-actions { display:none; margin-left:auto; gap:.4rem; }
        .icon-btn { width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:none; border:1px solid rgba(212,168,67,.3); color:var(--gold); cursor:pointer; }
        .icon-btn svg { width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
        .topbar a:focus-visible, .topbar button:focus-visible, .bottombar a:focus-visible, .bottombar button:focus-visible, .sheet a:focus-visible, .sheet button:focus-visible, .col-chip:focus-visible { outline:2px solid var(--gold); outline-offset:3px; }
        .bottombar { display:none; }
        .col-strip { display:none; }
        .sheet-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:400; }
        .sheet { position:fixed; left:0; right:0; bottom:0; max-height:85vh; overflow-y:auto; z-index:401; background:rgba(15,26,46,.99); border-top:2px solid var(--gold); padding:1rem 0 calc(1.2rem + env(safe-area-inset-bottom)); }
        .sheet-head { display:flex; align-items:center; justify-content:space-between; padding:0 1.2rem .6rem; font-family:var(--font-bebas); letter-spacing:4px; color:var(--gold); }
        .sheet a { display:block; padding:.95rem 1.4rem; color:rgba(242,235,217,.85); text-decoration:none; font-family:var(--font-bebas); font-size:1.05rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; }
        .sheet a:hover { color:var(--gold); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .sheet a.sheet-all { margin-top:.4rem; border-top:1px solid rgba(212,168,67,.2); color:var(--gold); }
        .hero-link { display:inline-block; margin-left:1.6rem; color:rgba(242,235,217,.65); font-family:var(--font-dm); font-size:.9rem; text-decoration:underline; text-underline-offset:4px; transition:color .25s; }
        .hero-link:hover { color:var(--gold); }
        .variant-chip { display:flex; flex-direction:column; align-items:center; gap:1px; padding:.35rem .75rem; background:var(--red); color:var(--creme); text-decoration:none; border-radius:2px; transition:background .3s,color .3s; }
        .variant-chip .vc-type { font-family:var(--font-bebas); letter-spacing:1px; font-size:.78rem; line-height:1.1; white-space:nowrap; }
        .variant-chip .vc-price { font-family:var(--font-dm); font-size:.72rem; opacity:.9; line-height:1.1; white-space:nowrap; }
        .variant-chip:hover { background:var(--gold); color:var(--navy); }
        .col-chip { flex:0 0 auto; padding:.55rem 1rem; border:1px solid rgba(212,168,67,.35); color:var(--creme); text-decoration:none; font-family:var(--font-bebas); letter-spacing:2px; font-size:.85rem; text-transform:uppercase; white-space:nowrap; }
        .col-chip:hover { border-color:var(--gold); color:var(--gold); }
        @media(max-width:900px) {
          .topbar { height:56px; gap:1rem; }
          .topbar-logo img { height:32px; }
          .topnav { display:none; }
          .topbar-actions { display:flex; }
          section[id], #colecoes { scroll-margin-top:68px; }
          .main-content { padding-bottom:calc(64px + env(safe-area-inset-bottom)); }
          .bottombar { display:flex; position:fixed; left:0; right:0; bottom:0; z-index:150; padding-bottom:env(safe-area-inset-bottom); background:rgba(15,26,46,.98); border-top:1px solid rgba(212,168,67,.3); backdrop-filter:blur(12px); }
          .bottombar a, .bottombar button { flex:1; min-height:56px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; background:none; border:none; cursor:pointer; color:rgba(242,235,217,.6); text-decoration:none; font-family:var(--font-bebas); font-size:.78rem; letter-spacing:2px; text-transform:uppercase; }
          .bottombar svg { width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
          .bottombar .active { color:var(--gold); }
          .col-strip { display:flex; gap:.6rem; overflow-x:auto; max-width:100%; padding:0 0 .6rem; margin:0 0 1.2rem; -webkit-overflow-scrolling:touch; scrollbar-width:thin; }
        }
        @media(prefers-reduced-motion: reduce) { .topnav-link::after, .variant-chip, .product-card { transition:none; } }
        .reveal { opacity:0; transform:translateY(30px); transition:opacity .7s ease,transform .7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal.no-observe { opacity:1; transform:none; }
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
        .product-card:hover { border-color:var(--gold); box-shadow:0 12px 24px rgba(0,0,0,.35); }
        .product-card-img-wrap { position:relative; cursor:zoom-in; overflow:hidden; }
        .product-card-img-wrap img { transition:transform .4s ease; }
        .product-card-img-wrap:hover img { transform:scale(1.06); }
        .social-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; min-height:480px; contain:layout style; }
        .social-card blockquote { min-height:440px; }
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

      <header className="topbar">
        <a href="#hero" className="topbar-logo" aria-label="Ô bicha! — início">
          <img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" />
        </a>
        <nav className="topnav" aria-label="Principal">
          <a href="#produtos" className={`topnav-link ${active === 'produtos' ? 'active' : ''}`} aria-current={active === 'produtos' ? 'true' : undefined}>Produtos</a>
          {collectionList.length > 0 && (
            <NavDropdown label="Coleções" active={false}>
              {collectionList.map(c => <a key={c.id} href={`/colecao/${c.slug}`}>{c.name}</a>)}
            </NavDropdown>
          )}
          {slides.length > 0 && (
            <a href="#destaques" className={`topnav-link ${active === 'destaques' ? 'active' : ''}`} aria-current={active === 'destaques' ? 'true' : undefined}>Destaques</a>
          )}
          <NavDropdown label="Sobre Nós" active={['manifesto', 'compromissos', 'amargen'].includes(active)}>
            {ABOUT_LINKS.slice(0, 4).map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </NavDropdown>
          <NavDropdown label="Mais" active={false}>
            {ABOUT_LINKS.slice(4).map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </NavDropdown>
          <button type="button" className="topnav-link" onClick={openSearch} aria-label="Buscar produtos">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></svg>Busca
          </button>
        </nav>
        <div className="topbar-actions">
          <button type="button" className="icon-btn" onClick={openSearch} aria-label="Buscar produtos">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></svg>
          </button>
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu completo" aria-haspopup="dialog" aria-expanded={menuOpen}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <MoreSheet title="Menu" onClose={() => setMenuOpen(false)}>
          {ABOUT_LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </MoreSheet>
      )}
      {colOpen && (
        <MoreSheet title="Escolha uma coleção" onClose={() => setColOpen(false)}>
          {collectionList.map(c => <a key={c.id} href={`/colecao/${c.slug}`}>{c.name}</a>)}
          <a href="#produtos" className="sheet-all">Ver todos os produtos</a>
        </MoreSheet>
      )}

      <nav className="bottombar" aria-label="Navegação rápida">
        <a href="#hero" className={active === 'hero' || active === 'destaques' ? 'active' : ''}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 9l7-6 7 6v8H3z"/><path d="M8 17v-5h4v5"/></svg>Início
        </a>
        <a href="#produtos" className={active === 'produtos' ? 'active' : ''}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></svg>Produtos
        </a>
        {collectionList.length > 0 && (
          <button type="button" onClick={() => setColOpen(true)} aria-haspopup="dialog" aria-expanded={colOpen}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="6" height="6"/><rect x="11" y="3" width="6" height="6"/><rect x="3" y="11" width="6" height="6"/><rect x="11" y="11" width="6" height="6"/></svg>Coleções
          </button>
        )}
        <button type="button" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4.5" cy="10" r="1.2"/><circle cx="10" cy="10" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/></svg>Mais
        </button>
      </nav>

      <div className="main-content">
        <section id="hero" style={{ minHeight:'clamp(380px,62vh,640px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', background:'var(--navy)' }}>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
            {[300,500,700,900,1100].map((size,i) => (
              <div key={size} className="ring" style={{ width:size, height:size, animationDelay:`${i*0.5}s`, borderColor:i%2===1?'rgba(192,40,28,.1)':undefined }} />
            ))}
          </div>
          <div className="hero-content" style={{ position:'relative', zIndex:2, textAlign:'center', padding:'1.5rem 1.2rem' }}>
            <div style={{ fontFamily:'var(--font-bebas)', letterSpacing:'6px', fontSize:'.9rem', color:'var(--gold)', marginBottom:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
              <span style={{ color:'var(--red)', fontSize:'.7rem' }}>★</span>Camisetas com Orgulho<span style={{ color:'var(--red)', fontSize:'.7rem' }}>★</span>
            </div>
            <img src="/banner.png" alt="Ô bicha!" style={{ maxWidth:'min(680px,88vw)', width:'100%', borderRadius:4, animation:'banner-glow 3s ease-in-out infinite alternate', marginBottom:'1.2rem' }} />
            <p style={{ fontFamily:'var(--font-playfair)', fontStyle:'italic', fontSize:'clamp(1.2rem,3vw,1.8rem)', color:'var(--creme)', marginBottom:'1.5rem', opacity:.9 }}>
              Desde sempre, <strong style={{ color:'var(--gold)', fontStyle:'normal' }}>um grito de liberdade.</strong>
            </p>
            <a href="#produtos" className="btn-primary">Ver Estampas</a>
            <a href="#manifesto" className="hero-link">Nossa História</a>
          </div>
        </section>

        {slides.length > 0 && (
          <section id="destaques" style={{ background:'var(--navy)', padding:'4rem 0 2rem' }}>
            <div style={{ textAlign:'center', marginBottom:'2rem', padding:'0 2rem' }}>
              <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Em Destaque ★</span>
              <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:900, lineHeight:1.1 }}>Coleções <em style={{ color:'var(--red)' }}>especiais.</em></h2>
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
          <div className="reveal" style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Coleção ★</span>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1 }}>Vista o <em style={{ color:'var(--gold)' }}>deboche.</em></h2>
            <div className="section-divider"><span style={{ color:'var(--gold)' }}>✦</span></div>
            <p style={{ opacity:.6, fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>Camisetas · Canecas · Ecobags · Bottoms</p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.2rem', marginBottom:'2rem' }}>
            {collectionList.length > 0 && (
              <nav id="colecoes" className="col-strip" aria-label="Coleções" style={{ width:'100%' }}>
                {collectionList.map(c => <a key={c.id} href={`/colecao/${c.slug}`} className="col-chip">{c.name}</a>)}
              </nav>
            )}
            <input
              id="busca-produtos"
              type="search"
              aria-label="Buscar produto"
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding:'.6rem 1.2rem', background:'rgba(255,255,255,.05)', border:'1px solid rgba(212,168,67,.3)', color:'var(--creme)', fontFamily:'var(--font-dm)', fontSize:'.9rem', outline:'none', width:'min(400px,90vw)', borderRadius:2 }}
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'2rem', maxWidth:1200, margin:'0 auto' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', opacity:.3, padding:'4rem' }}>
                <p style={{ fontSize:'3rem' }}>👕</p>
                <p style={{ marginTop:'1rem' }}>{products.length === 0 ? 'Produtos em breve' : 'Nenhum produto encontrado'}</p>
              </div>
            ) : filteredProducts.map(p => (
              <div key={p.id} className="product-card">
                {p.image_url
                  ? <div className="product-card-img-wrap" onClick={() => setLightboxImg(p.image_url!)}><img src={p.image_url} alt={p.name} style={{ width:'100%', aspectRatio:1, objectFit:'cover', display:'block' }} /></div>
                  : <div style={{ width:'100%', aspectRatio:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.05)', gap:'.5rem' }}><span style={{ fontSize:'3rem', opacity:.3 }}>👕</span></div>
                }
                <div style={{ padding:'1.2rem' }}>
                  <div style={{ fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'3px', color:'var(--gold)', marginBottom:'.3rem' }}>{catLabel(p.category)}</div>
                  <div style={{ fontFamily:'var(--font-playfair)', fontSize:'1.05rem', fontWeight:700, marginBottom:'.8rem', lineHeight:1.3 }}>
                    {p.slug ? (
                      <Link href={`/produtos/${p.slug}`} style={{ color:'inherit', textDecoration:'none' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='inherit'}>
                        {p.name}
                      </Link>
                    ) : p.name}
                  </div>
                  {(() => {
                    let variants: any[] = p.manual_variants
                    if (typeof variants === 'string') { try { variants = JSON.parse(variants) } catch { variants = [] } }
                    if (!Array.isArray(variants)) variants = []
                    const detailLink = p.slug ? (
                      <Link href={`/produtos/${p.slug}`} style={{ fontSize:'.75rem', color:'var(--gold)', textDecoration:'underline', textUnderlineOffset:3, whiteSpace:'nowrap' }} aria-label={`Ver detalhes de ${p.name}`}>Ver detalhes</Link>
                    ) : null
                    if (variants.length > 0) {
                      // Preço inicial = menor preço entre as variantes que têm preço
                      const priced = variants.filter(v => !Number.isNaN(priceNum(v.price)))
                      const from = priced.length ? priced.reduce((m, v) => (priceNum(v.price) < priceNum(m.price) ? v : m)).price : null
                      const partners = Array.from(new Set(variants.map(v => supplierLabel((v.type && VARIANT_SUPPLIER_MAP[v.type]) || p.supplier || v.link || p.link)).filter(Boolean)))
                      return (
                        <>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.6rem', marginBottom:'.7rem' }}>
                            <span style={{ fontSize:'.85rem', color:'rgba(242,235,217,.75)' }}>{from ? <>A partir de <strong style={{ color:'var(--gold)' }}>{from}</strong></> : 'Escolha o modelo'}</span>
                            {detailLink}
                          </div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                            {variants.map((v, i) => (
                              <a key={i} href={v.link || p.link} target="_blank" rel="noopener" data-analytics-tracked className="variant-chip"
                                aria-label={`${v.type}${v.price ? ', ' + v.price : ''} — abre a loja parceira`}
                                onClick={() => trackProductClick(`${p.name} — ${v.type}`, { supplier: VARIANT_SUPPLIER_MAP[v.type] || p.supplier || undefined, collection: p.collections?.[0]?.slug, position: 'landing_grid' })}
                              >
                                <span className="vc-type">{v.type}</span>
                                {v.price && <span className="vc-price">{v.price}</span>}
                              </a>
                            ))}
                          </div>
                          <p style={{ margin:'.6rem 0 0', fontSize:'.68rem', lineHeight:1.4, color:'rgba(242,235,217,.5)' }}>
                            Você será direcionado à loja parceira{partners.length ? ` (${partners.join(' e ')})` : ''} para finalizar o pedido.
                          </p>
                        </>
                      )
                    }
                    const single = supplierLabel(p.supplier || p.link)
                    return (
                      <>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.6rem' }}>
                          <span style={{ fontSize:'.85rem', color:'rgba(242,235,217,.75)' }}>{p.price}</span>
                          <div style={{ display:'flex', alignItems:'center', gap:'.8rem' }}>
                            {detailLink}
                            <a href={p.link} target="_blank" rel="noopener" data-analytics-tracked onClick={() => trackProductClick(p.name, { supplier: p.supplier || (/umapenca/i.test(p.link || '') ? 'uma-penca' : /reservaink/i.test(p.link || '') ? 'reserva-ink' : undefined), collection: p.collections?.[0]?.slug, position: 'landing_grid' })} style={{ padding:'.4rem 1rem', background:'var(--red)', color:'var(--creme)', fontFamily:'var(--font-bebas)', letterSpacing:'1px', fontSize:'.8rem', textDecoration:'none', transition:'background .3s', borderRadius:2 }}
                              onMouseEnter={e => (e.target as HTMLElement).style.background='var(--gold)'}
                              onMouseLeave={e => (e.target as HTMLElement).style.background='var(--red)'}
                            >Ver na loja</a>
                          </div>
                        </div>
                        <p style={{ margin:'.6rem 0 0', fontSize:'.68rem', lineHeight:1.4, color:'rgba(242,235,217,.5)' }}>
                          Você será direcionado à loja parceira{single ? ` (${single})` : ''} para finalizar o pedido.
                        </p>
                      </>
                    )
                  })()}
                  {p.collections && p.collections.length > 0 && (
                    <div style={{ marginTop:'.4rem', display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                      {p.collections.map(c => (
                        <a key={c.id} href={`/colecao/${c.slug}`} style={{ fontSize:'.68rem', color:'rgba(212,168,67,.5)', textDecoration:'none', letterSpacing:'1px', transition:'color .3s' }}
                          onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'}
                          onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(212,168,67,.5)'}
                        >Ver coleção {c.name} →</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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

        <section id="compromissos" style={{ background:'var(--creme)', color:'var(--navy)', padding:'6rem 2rem' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
              <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--red)', display:'block', marginBottom:'.5rem' }}>★ Nossa Missão ★</span>
              <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1, color:'var(--navy)' }}>Moda <em style={{ color:'var(--red)' }}>consciente</em><br />de verdade.</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'2rem' }}>
              {[
                { num:'01', icon:<CommitmentIcon1/>, title:'Materiais de Qualidade', desc:'Camiseta em algodão, dry fit, moletom e mais — cada modelo com o tecido certo pra seu uso. Toque macio, caimento e durabilidade que resistem à moda descartável.' },
                { num:'02', icon:<CommitmentIcon2/>, title:'Produção Sob Demanda', desc:'Cada peça é fabricada só depois do seu pedido, junto com nossas parceiras de produção. Sem estoque parado, sem desperdício de peça que não seria vendida.' },
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

        <section id="como-funciona" style={{ background:'rgba(255,255,255,.02)', padding:'6rem 2rem' }}>
          <div className="reveal" style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
              <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Como Funciona ★</span>
              <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.8rem,4.5vw,2.8rem)', fontWeight:900, lineHeight:1.15 }}>Da estampa até<br /><em style={{ color:'var(--gold)' }}>a sua casa.</em></h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'2.5rem' }}>
              <div>
                <p style={{ fontFamily:'var(--font-bebas)', fontSize:'1.05rem', letterSpacing:'1px', color:'var(--gold)', marginBottom:'.8rem' }}>PRODUÇÃO SOB DEMANDA</p>
                <p style={{ fontSize:'.92rem', lineHeight:1.75, opacity:.8 }}>
                  Cada peça é fabricada só depois que você faz o pedido, em parceria com nossas fábricas parceiras especializadas. Isso evita estoque parado e permite produzir cada item de acordo com a demanda real.
                </p>
              </div>
              <div>
                <p style={{ fontFamily:'var(--font-bebas)', fontSize:'1.05rem', letterSpacing:'1px', color:'var(--gold)', marginBottom:'.8rem' }}>ONDE VOCÊ COMPRA</p>
                <p style={{ fontSize:'.92rem', lineHeight:1.75, opacity:.8 }}>
                  A Ô bicha! cria as estampas e a identidade de cada produto. O pedido, o pagamento, a fabricação e o envio são feitos pelas nossas fábricas parceiras — Reserva INK e Uma Penca. Mas o atendimento é sempre com a gente: qualquer dúvida sobre seu pedido, prazo, troca ou pagamento, é só chamar pelo{' '}
                  <a href={whatsappUrl} target="_blank" style={{ color:'var(--gold)' }}>WhatsApp</a>, pelo e-mail{' '}
                  <a href="mailto:faleconosco@obicha.com.br" style={{ color:'var(--gold)' }}>faleconosco@obicha.com.br</a> ou pelas nossas redes sociais.
                </p>
              </div>
            </div>
            <p style={{ textAlign:'center', fontSize:'.78rem', opacity:.4, marginTop:'2.5rem', fontStyle:'italic', fontFamily:'var(--font-playfair)' }}>
              Ao escolher um modelo, você é direcionado pra página da loja parceira pra finalizar a compra.
            </p>
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
          <div className="reveal" style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem' }}>★ Siga a gente ★</span>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, lineHeight:1.1 }}>A gente vive <em style={{ color:'var(--gold)' }}>nas redes.</em></h2>
            <div className="section-divider"><span style={{ color:'var(--gold)' }}>✦</span></div>
            <p style={{ opacity:.6, fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>Instagram · TikTok · Pinterest · WhatsApp</p>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:'2rem', flexWrap:'wrap' }}>
            <a href={instagramUrl} target="_blank" className="social-icon-link" style={{ width:64, height:64 }} title="Instagram"><svg viewBox="0 0 24 24" style={{ width:26, height:26 }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href={tiktokUrl} target="_blank" className="social-icon-link" style={{ width:64, height:64 }} title="TikTok"><svg viewBox="0 0 24 24" style={{ width:26, height:26 }}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg></a>
            <a href={pinterestUrl} target="_blank" className="social-icon-link" style={{ width:64, height:64 }} title="Pinterest"><svg viewBox="0 0 24 24" style={{ width:26, height:26 }}><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
            <a href={whatsappUrl} target="_blank" className="social-icon-link" style={{ width:64, height:64 }} title="WhatsApp"><svg viewBox="0 0 24 24" style={{ width:26, height:26 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></a>
          </div>
        </section>

        <section style={{ background:'var(--navy)', padding:'8rem 2rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', fontFamily:'var(--font-bebas)', fontSize:'clamp(6rem,20vw,16rem)', color:'rgba(212,168,67,.04)', letterSpacing:'5px', whiteSpace:'nowrap', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', lineHeight:1 }}>ÔBICHA</div>
          <div className="reveal" style={{ position:'relative', zIndex:2 }}>
            <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:900, lineHeight:1.1, marginBottom:'1rem' }}>
              Vista o deboche.<br /><em style={{ color:'var(--red)' }}>Espalhe o amor.</em><br /><strong style={{ color:'var(--gold)' }}>Carregue a resistência.</strong>
            </h2>
            <p style={{ fontSize:'1.1rem', opacity:.7, marginBottom:'3rem', fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>Deboche, amor e resistência. Feito no Brasil.</p>
            <a href="#produtos" className="btn-primary" style={{ fontSize:'1.3rem', padding:'1.2rem 4rem' }}>Ver Estampas</a>
          </div>
        </section>

        <footer style={{ background:'#0f1a2e', borderTop:'1px solid rgba(212,168,67,.2)', padding:'3rem 2rem', textAlign:'center' }}>
          <span style={{ fontFamily:'var(--font-bebas)', fontSize:'2.5rem', color:'var(--gold)', letterSpacing:'3px', display:'block', marginBottom:'1rem' }}>Ô<span style={{ color:'var(--red)' }}>bicha</span>!</span>
          <p style={{ fontFamily:'var(--font-playfair)', fontStyle:'italic', fontSize:'.9rem', color:'rgba(242,235,217,.5)', marginBottom:'2rem' }}>Deboche, amor e resistência. Feito no Brasil.</p>
          <div style={{ display:'flex', justifyContent:'center', gap:'2rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            {[['#manifesto','Manifesto'],['#produtos','Produtos'],['#compromissos','Missão'],['#amargen','Causa'],['#social','Redes']].map(([href,label]) => (
              <a key={href} href={href} style={{ color:'rgba(242,235,217,.5)', textDecoration:'none', fontSize:'.8rem', letterSpacing:'1px', textTransform:'uppercase', transition:'color .3s' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.5)'}>{label}</a>
            ))}
            <a href="https://institutoamargen.com.br" target="_blank" style={{ color:'rgba(242,235,217,.5)', textDecoration:'none', fontSize:'.8rem', letterSpacing:'1px', textTransform:'uppercase', transition:'color .3s' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.5)'}>Instituto Amargen</a>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:'1.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            <a href="/camisetas-lgbt" style={{ color:'rgba(242,235,217,.2)', textDecoration:'none', fontSize:'.7rem', letterSpacing:'1px' }}>Camisetas LGBT</a>
            <span style={{ color:'rgba(242,235,217,.1)' }}>·</span>
            <a href="/moda-queer" style={{ color:'rgba(242,235,217,.2)', textDecoration:'none', fontSize:'.7rem', letterSpacing:'1px' }}>Moda Queer</a>
            <span style={{ color:'rgba(242,235,217,.1)' }}>·</span>
            <a href="/camiseta-orgulho-gay" style={{ color:'rgba(242,235,217,.2)', textDecoration:'none', fontSize:'.7rem', letterSpacing:'1px' }}>Camiseta Orgulho Gay</a>
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
            <span style={{ color:'rgba(242,235,217,.15)' }}>·</span>
            <a href="/politica-de-privacidade" style={{ fontSize:'.72rem', color:'rgba(242,235,217,.3)', textDecoration:'none' }} onMouseEnter={e => (e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e => (e.target as HTMLElement).style.color='rgba(242,235,217,.3)'}>Política de Privacidade</a>
          </div>
        </footer>
      </div>
    </>
  )
}

// Item de menu com lista suspensa (padrão "disclosure": acessível por teclado e leitor de tela)
function NavDropdown({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const id = 'dd-' + label.toLowerCase().replace(/[^a-z]/g, '')

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div
      className="topnav-menu" ref={ref}
      onMouseEnter={e => { if ((e.nativeEvent as PointerEvent).pointerType !== 'touch') setOpen(true) }}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={e => { if (e.key === 'Escape' && open) { setOpen(false); btnRef.current?.focus() } }}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false) }}
    >
      <button ref={btnRef} type="button" className={`topnav-link ${active ? 'active' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        {label}
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5"/></svg>
      </button>
      {open && <div id={id} className="topnav-panel" onClick={e => { if ((e.target as HTMLElement).closest('a')) setOpen(false) }}>{children}</div>}
    </div>
  )
}

// Menu "Mais" (celular): folha inferior com foco preso, Esc fecha e devolve o foco
function MoreSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('button, a')?.focus()
    return () => { document.body.style.overflow = prevOverflow; opener?.focus?.() }
  }, [])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (e.key !== 'Tab' || !ref.current) return
    const f = Array.from(ref.current.querySelectorAll<HTMLElement>('a[href], button'))
    if (!f.length) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div className="sheet" ref={ref} role="dialog" aria-modal="true" aria-label={title} onKeyDown={onKeyDown} onClick={e => { if ((e.target as HTMLElement).closest('a')) onClose() }}>
        <div className="sheet-head">
          <span>{title.toUpperCase()}</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar menu">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>
          </button>
        </div>
        {children}
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
