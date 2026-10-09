import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import postgres from 'postgres'
import ZoomableProductImage from '@/components/ZoomableProductImage'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [category] = await sql`SELECT * FROM categories WHERE value = ${slug} AND active = true`
  if (!category) return {}
  return {
    title: `${category.label} — Ô bicha!`,
    description: `Confira todos os produtos da categoria ${category.label} da Ô bicha! — moda LGBT com orgulho, deboche e resistência.`,
    alternates: { canonical: `https://www.obicha.com.br/categoria/${slug}` },
  }
}

const supplierLabel = (s: string | null) => {
  if (s === 'reserva-ink-dtg') return '✦ Reserva INK · DTG · Qualidade Reserva'
  if (s === 'uma-penca-dtf') return '✦ Uma Penca · DTF · Qualidade Chico Rei'
  return null
}

// Categoria (slug do site) -> nome do tipo de variante correspondente
const CATEGORY_TO_VARIANT_TYPE: Record<string, string> = {
  camisetas: 'Camiseta',
  estonada: 'Estonada',
  dryfit: 'Dry Fit',
  modal: 'Modal Tech',
  peruano: 'Camiseta Algodão Peruano',
  oversized: 'Camiseta Oversized',
  regata: 'Regata',
  cropped: 'Cropped',
  'cropped-moletom': 'Cropped Moletom',
  infantil: 'Camiseta Infantil',
  hoodie: 'Hoodie Moletom',
  sueter: 'Suéter Moletom',
  bones: 'Boné',
  canecas: 'Caneca',
  ecobags: 'Ecobag',
  bottoms: 'Kit de Bottons',
}

function parseVariants(mv: any): { type: string; price: string; link: string; image_url?: string }[] {
  if (typeof mv === 'string') { try { mv = JSON.parse(mv) } catch { return [] } }
  return Array.isArray(mv) ? mv : []
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [category] = await sql`SELECT * FROM categories WHERE value = ${slug} AND active = true`
  if (!category) notFound()

  const variantType = CATEGORY_TO_VARIANT_TYPE[slug]
  const products = variantType
    ? await sql`
        SELECT * FROM products
        WHERE category = ${slug}
           OR manual_variants @> ${JSON.stringify([{ type: variantType }])}::jsonb
        ORDER BY created_at DESC`
    : await sql`SELECT * FROM products WHERE category = ${slug} ORDER BY created_at DESC`
  const allCategories = await sql`SELECT * FROM categories WHERE active = true ORDER BY position ASC`

  return (
    <>
      <style>{`
        .obicha-legacy { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --red-deep:#8B1A10; --gold:#D4A843; --sidebar:220px; }
        .obicha-legacy *, .obicha-legacy *::before, .obicha-legacy *::after { box-sizing:border-box; }
        .obicha-legacy, .obicha-legacy { margin:0; padding:0; background:var(--navy); color:var(--ink); font-family:var(--font-dm),sans-serif; overflow-x:hidden; }
        .obicha-legacy .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar); background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2); display:flex; flex-direction:column; z-index:200; }
        .obicha-legacy .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .obicha-legacy .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .obicha-legacy .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; overflow-y:auto; }
        .obicha-legacy .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(26,39,68,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .obicha-legacy .sidebar-link:hover { color:var(--ink); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .obicha-legacy .sidebar-link svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; opacity:.7; }
        .obicha-legacy .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .obicha-legacy .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; transition:all .3s; }
        .obicha-legacy .sidebar-cta:hover { background:var(--gold); color:var(--navy); }
        .obicha-legacy .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; }
        .obicha-legacy .product-card { background:rgba(26,39,68,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; transition:all .4s; }
        .obicha-legacy .product-card:hover { border-color:var(--gold); box-shadow:0 12px 24px rgba(0,0,0,.35); }
        .obicha-legacy .btn-loja { padding:.4rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:1px; font-size:.8rem; text-decoration:none; border-radius:2px; transition:background .3s; display:inline-block; }
        .obicha-legacy .btn-loja:hover { background:var(--gold); }
        .obicha-legacy .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--ink); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .obicha-legacy .back-link:hover { opacity:1; }
        .obicha-legacy .cat-tag { padding:.5rem 1.2rem; border:1px solid rgba(212,168,67,.3); color:rgba(26,39,68,.6); text-decoration:none; font-family:var(--font-bebas); letter-spacing:2px; font-size:.85rem; transition:all .25s; }
        .obicha-legacy .cat-tag:hover, .obicha-legacy .cat-tag.active { border-color:var(--gold); color:var(--gold); }
        @media(max-width:900px) { .obicha-legacy .sidebar { display:none; } .obicha-legacy .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>



      <main className="main">
        <Link href="/" className="back-link">← Voltar</Link>

        <div style={{ marginBottom:'4rem' }}>
          <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem', opacity:.7 }}>★ Categoria ★</span>
          <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,6vw,4rem)', fontWeight:900, lineHeight:1, marginBottom:'1rem' }}>
            {category.label}
          </h1>
          <p style={{ opacity:.5, fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>
            {(products as any[]).length} {(products as any[]).length === 1 ? 'produto' : 'produtos'} nesta categoria
          </p>
        </div>

        {(products as any[]).length === 0 ? (
          <div style={{ textAlign:'center', opacity:.3, padding:'6rem 0' }}>
            <p style={{ fontSize:'3rem' }}>👕</p>
            <p style={{ marginTop:'1rem' }}>Nenhum produto nesta categoria ainda.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'2rem', maxWidth:1200, marginBottom:'5rem' }}>
            {(products as any[]).map((p: any) => {
              const variants = parseVariants(p.manual_variants)
              const matchedVariant = variantType ? variants.find(v => v.type === variantType) : null
              const displayPrice = matchedVariant?.price || p.price
              const displayLink = matchedVariant?.link || p.link
              return (
              <div key={p.id} className="product-card" data-product-name={p.name}>
                {p.image_url
                  ? <ZoomableProductImage src={p.image_url} alt={p.name} />
                  : <div style={{ width:'100%', aspectRatio:1, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.05)', fontSize:'3rem', opacity:.3 }}>👕</div>
                }
                <div style={{ padding:'1.2rem' }}>
                  {matchedVariant && (
                    <div style={{ fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'3px', color:'var(--gold)', marginBottom:'.3rem' }}>{matchedVariant.type}</div>
                  )}
                  <div style={{ fontFamily:'var(--font-playfair)', fontSize:'1.05rem', fontWeight:700, marginBottom:'.5rem', lineHeight:1.3 }}>{p.name}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.5rem' }}>
                    <span style={{ fontSize:'.85rem', color:'rgba(26,39,68,.7)' }}>{displayPrice}</span>
                    <a href={`/?product=${p.id}`} target="_blank" className="btn-loja">Ver na loja</a>
                  </div>
                  {supplierLabel(p.supplier) && (
                    <p style={{ fontSize:'.68rem', color:'rgba(212,168,67,.4)', letterSpacing:'.5px' }}>{supplierLabel(p.supplier)}</p>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Outras categorias */}
        <div style={{ paddingTop:'3rem', borderTop:'1px solid rgba(212,168,67,.15)' }}>
          <p style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'4px', color:'var(--gold)', opacity:.6, marginBottom:'1.5rem' }}>★ Outras categorias ★</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.75rem' }}>
            {(allCategories as any[]).filter((c: any) => c.value !== slug).map((c: any) => (
              <Link key={c.id} href={`/categoria/${c.value}`} className="cat-tag">{c.label}</Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
