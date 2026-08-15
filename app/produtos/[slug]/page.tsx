import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import postgres from 'postgres'
import ZoomableProductImage from '@/components/ZoomableProductImage'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

function parseVariants(mv: any): { type: string; price: string; link: string }[] {
  if (typeof mv === 'string') { try { mv = JSON.parse(mv) } catch { return [] } }
  return Array.isArray(mv) ? mv : []
}

function parsePriceToNumber(price: string): string {
  const match = (price || '').replace(/\./g, '').match(/(\d+),?(\d{0,2})/)
  if (!match) return '0'
  const cents = match[2] ? match[2].padEnd(2, '0') : '00'
  return `${match[1]}.${cents}`
}

const supplierName = (s: string | null) => {
  if (s === 'reserva-ink-dtg') return 'Reserva INK'
  if (s === 'uma-penca-dtf') return 'Uma Penca'
  return 'Ô bicha!'
}

// Cada tipo de variante pertence a um fabricante específico — importante pra produtos que misturam os dois
const VARIANT_TYPE_TO_SUPPLIER: Record<string, string> = {
  'Camiseta': 'Reserva INK',
  'Regata': 'Reserva INK',
  'Cropped': 'Reserva INK',
  'Cropped Moletom': 'Reserva INK',
  'Camiseta Oversized': 'Reserva INK',
  'Camiseta Algodão Peruano': 'Reserva INK',
  'Camiseta Infantil': 'Reserva INK',
  'Hoodie Moletom': 'Reserva INK',
  'Suéter Moletom': 'Reserva INK',
  'Dry Fit': 'Uma Penca',
  'Ecobag': 'Uma Penca',
  'Caneca': 'Uma Penca',
  'Kit de Bottons': 'Uma Penca',
}

function sellerForVariant(variantType: string, fallbackSupplier: string | null): string {
  return VARIANT_TYPE_TO_SUPPLIER[variantType] || supplierName(fallbackSupplier)
}

async function getProduct(slug: string) {
  const [product] = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`
  return product || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  const desc = product.description || `${product.name} — camiseta LGBT com orgulho, deboche e resistência. Compre na Ô bicha!`
  return {
    title: `${product.name} — Ô bicha!`,
    description: desc.slice(0, 160),
    alternates: { canonical: `https://www.obicha.com.br/produtos/${slug}` },
    openGraph: {
      title: product.name,
      description: desc.slice(0, 160),
      images: product.image_url ? [{ url: product.image_url }] : [],
      type: 'website',
    },
  }
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const variants = parseVariants(product.manual_variants)
  const hasVariants = variants.length > 0

  // Monta as ofertas do Schema.org — uma por variante, cada uma com o fabricante certo
  const offers = hasVariants
    ? variants.map((v) => ({
        '@type': 'Offer',
        name: v.type,
        price: parsePriceToNumber(v.price),
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: v.link,
        seller: { '@type': 'Organization', name: sellerForVariant(v.type, product.supplier) },
      }))
    : [{
        '@type': 'Offer',
        price: parsePriceToNumber(product.price),
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: product.link,
        seller: { '@type': 'Organization', name: supplierName(product.supplier) },
      }]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url] : undefined,
    description: product.description || `${product.name} — moda LGBT com orgulho, deboche e resistência.`,
    brand: { '@type': 'Brand', name: 'Ô bicha!' },
    offers: hasVariants
      ? { '@type': 'AggregateOffer', priceCurrency: 'BRL', offerCount: offers.length, offers }
      : offers[0],
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.obicha.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Produtos', item: 'https://www.obicha.com.br/produtos' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://www.obicha.com.br/produtos/${slug}` },
    ],
  }

  const relatedProducts = await sql`
    SELECT id, name, slug, image_url, price FROM products
    WHERE category = ${product.category} AND id != ${product.id}
    ORDER BY RANDOM() LIMIT 4`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --gold:#D4A843; --sidebar:220px; }
        *, *::before, *::after { box-sizing:border-box; }
        html, body { margin:0; padding:0; background:var(--navy); color:var(--creme); font-family:var(--font-dm),sans-serif; overflow-x:hidden; }
        .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar); background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2); display:flex; flex-direction:column; z-index:200; }
        .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; overflow-y:auto; }
        .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(242,235,217,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .sidebar-link:hover { color:var(--gold); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .sidebar-link svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; opacity:.7; }
        .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; transition:all .3s; }
        .sidebar-cta:hover { background:var(--gold); color:var(--navy); }
        .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; }
        .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--gold); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .back-link:hover { opacity:1; }
        .btn-loja { padding:.7rem 1.4rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:1px; font-size:.9rem; text-decoration:none; border-radius:2px; transition:background .3s; display:inline-block; }
        .btn-loja:hover { background:var(--gold); color:var(--navy); }
        .btn-loja-sm { padding:.4rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:1px; font-size:.8rem; text-decoration:none; border-radius:2px; transition:background .3s; }
        .btn-loja-sm:hover { background:var(--gold); color:var(--navy); }
        .product-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; transition:all .4s; }
        .product-card:hover { border-color:var(--gold); box-shadow:0 12px 24px rgba(0,0,0,.35); }
        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; padding:2rem 1.5rem; } .product-detail { grid-template-columns:1fr!important; } }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/#produtos" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></svg>Produtos</Link>
          <Link href="/blog" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg>Blog</Link>
          <Link href="/parcerias" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 15a4 4 0 00-8 0v1h8v-1z"/></svg>Parcerias</Link>
          <Link href="/projeto-social" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/><path d="M10 9v4M8 11h4"/></svg>Projeto Social</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link href="/#produtos" className="sidebar-cta">Ver Produtos</Link>
        </div>
      </aside>

      <main className="main">
        <Link href="/produtos" className="back-link">← Todos os produtos</Link>

        <div className="product-detail" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', maxWidth: 1100, marginBottom: '5rem' }}>
          <div>
            {product.image_url ? (
              <ZoomableProductImage src={product.image_url} alt={product.name} square={false} />
            ) : (
              <div style={{ width: '100%', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', fontSize: '4rem', opacity: .3, borderRadius: 4 }}>👕</div>
            )}
          </div>

          <div>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '.8rem', letterSpacing: '3px', color: 'var(--gold)', display: 'block', marginBottom: '.8rem' }}>
              {supplierName(product.supplier).toUpperCase()}
            </span>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.2rem' }}>
              {product.name}
            </h1>

            {product.description && (
              <p style={{ opacity: .75, lineHeight: 1.7, marginBottom: '2rem', fontSize: '.95rem' }}>{product.description}</p>
            )}

            {hasVariants ? (
              <div>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '.8rem', letterSpacing: '2px', opacity: .6, marginBottom: '1rem' }}>ESCOLHA O MODELO</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                  {variants.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.1rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,168,67,.15)', borderRadius: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                        {(v.image_url || product.image_url) && (
                          <img src={v.image_url || product.image_url} alt={`${product.name} — ${v.type}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(212,168,67,.15)', flexShrink: 0 }} />
                        )}
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '.95rem' }}>{v.type}</p>
                          <p style={{ opacity: .6, fontSize: '.85rem' }}>{v.price}</p>
                        </div>
                      </div>
                      <a href={v.link} target="_blank" className="btn-loja-sm">Comprar na loja</a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.6rem', color: 'var(--gold)', marginBottom: '1.2rem' }}>{product.price}</p>
                <a href={product.link} target="_blank" className="btn-loja">Comprar na loja ↗</a>
              </div>
            )}

            <p style={{ opacity: .4, fontSize: '.78rem', marginTop: '2rem', fontStyle: 'italic', fontFamily: 'var(--font-playfair)' }}>
              A compra é feita direto na loja parceira — a Ô bicha! cuida da curadoria e do design.
            </p>
          </div>
        </div>

        {(relatedProducts as any[]).length > 0 && (
          <div style={{ maxWidth: 1100 }}>
            <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '.85rem', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '1.5rem' }}>VOCÊ TAMBÉM PODE GOSTAR</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.5rem' }}>
              {(relatedProducts as any[]).map((p: any) => (
                <Link key={p.id} href={`/produtos/${p.slug}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', fontSize: '2rem', opacity: .3 }}>👕</div>
                  }
                  <div style={{ padding: '.9rem' }}>
                    <p style={{ fontSize: '.85rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '.3rem' }}>{p.name}</p>
                    <p style={{ fontSize: '.8rem', opacity: .6 }}>{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
