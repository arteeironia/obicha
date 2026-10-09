import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductsByCollection, getCollections } from '@/lib/db-collections'
import ZoomableProductImage from '@/components/ZoomableProductImage'

export const dynamic = 'force-dynamic'

const collectionMeta: Record<string, { title: string; description: string }> = {
  'fetiche':     { title: 'Coleção Fetiche', description: 'Camisetas da coleção Fetiche da Ô bicha! — moda LGBT com atitude.' },
  'bear':        { title: 'Coleção Bear', description: 'Camisetas da coleção Bear da Ô bicha! — para a comunidade bear com orgulho.' },
  'queer':       { title: 'Coleção Queer', description: 'Camisetas da coleção Queer da Ô bicha! — moda queer brasileira com estilo.' },
  'pride':       { title: 'Coleção Pride', description: 'Camisetas da coleção Pride da Ô bicha! — orgulho LGBT em cada estampa.' },
  'raca':        { title: 'Coleção Raça', description: 'Camisetas da coleção Raça da Ô bicha! — representatividade e resistência.' },
  'diversidade': { title: 'Coleção Diversidade', description: 'Camisetas da coleção Diversidade da Ô bicha! — celebrando quem você é.' },
  'cultura-pop': { title: 'Coleção Cultura Pop', description: 'Camisetas da coleção Cultura Pop da Ô bicha! — referências que você ama.' },
  'ironicas':    { title: 'Coleção Irônicas', description: 'Camisetas da coleção Irônicas da Ô bicha! — humor e deboche fino.' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = collectionMeta[slug]
  if (!meta) return {}
  return {
    title: `${meta.title} — Ô bicha!`,
    description: meta.description,
    alternates: { canonical: `https://www.obicha.com.br/colecao/${slug}` },
  }
}

const catLabel = (cat: string) => ({
  camisetas: 'Camiseta Algodão', estonada: 'Camiseta Estonada', dryfit: 'Dry Fit',
  modal: 'Modal Tech', canecas: 'Caneca', ecobags: 'Ecobag', bottoms: 'Bottom'
}[cat] || cat)

export default async function ColecaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getProductsByCollection(slug) as any[]
  const collections = await getCollections() as any[]
  const collection = collections.find((c: any) => c.slug === slug)

  if (!collection) notFound()

  const meta = collectionMeta[slug] || { title: collection.name, description: `Coleção ${collection.name} da Ô bicha!` }

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
        .obicha-legacy .btn-loja { padding:.4rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:1px; font-size:.8rem; text-decoration:none; border-radius:2px; transition:background .3s; }
        .obicha-legacy .btn-loja:hover { background:var(--gold); }
        .obicha-legacy .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--ink); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .obicha-legacy .back-link:hover { opacity:1; }
        .obicha-legacy .col-tag { font-size:.68rem; color:rgba(212,168,67,.5); text-decoration:none; letter-spacing:1px; transition:color .3s; }
        .obicha-legacy .col-tag:hover { color:var(--gold); }
        .obicha-legacy .other-col-link { padding:.5rem 1.2rem; border:1px solid rgba(212,168,67,.3); color:rgba(26,39,68,.6); text-decoration:none; font-family:var(--font-bebas); letter-spacing:2px; font-size:.85rem; transition:all .25s; }
        .obicha-legacy .other-col-link:hover { border-color:var(--gold); color:var(--ink); }
        @media(max-width:900px) { .obicha-legacy .sidebar { display:none; } .obicha-legacy .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>



      <main className="main">
        <Link href="/" className="back-link">← Voltar</Link>

        <div style={{ marginBottom:'4rem' }}>
          <span style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'5px', color:'var(--gold)', display:'block', marginBottom:'.5rem', opacity:.7 }}>★ Coleção ★</span>
          <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(2.5rem,6vw,4rem)', fontWeight:900, lineHeight:1, marginBottom:'1rem' }}>
            {collection.name}
          </h1>
          <p style={{ opacity:.5, fontFamily:'var(--font-playfair)', fontStyle:'italic' }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'} nesta coleção
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign:'center', opacity:.3, padding:'6rem 0' }}>
            <p style={{ fontSize:'3rem' }}>👕</p>
            <p style={{ marginTop:'1rem' }}>Nenhum produto nesta coleção ainda.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'2rem', maxWidth:1200 }}>
            {products.map((p: any) => {
              let variants: any[] = p.manual_variants
              if (typeof variants === 'string') { try { variants = JSON.parse(variants) } catch { variants = [] } }
              if (!Array.isArray(variants)) variants = []
              return (
              <div key={p.id} className="product-card" data-product-name={p.name}>
                {p.image_url
                  ? <ZoomableProductImage src={p.image_url} alt={p.name} />
                  : <div style={{ width:'100%', aspectRatio:1, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.05)', fontSize:'3rem', opacity:.3 }}>👕</div>
                }
                <div style={{ padding:'1.2rem' }}>
                  <div style={{ fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'3px', color:'var(--gold)', marginBottom:'.3rem' }}>{catLabel(p.category)}</div>
                  <div style={{ fontFamily:'var(--font-playfair)', fontSize:'1.05rem', fontWeight:700, marginBottom:'.8rem', lineHeight:1.3 }}>{p.name}</div>
                  {variants.length > 0 ? (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                      {variants.map((v: any, i: number) => (
                        <a key={i} href={`/?product=${p.id}&model=${encodeURIComponent(v.type)}`} target="_blank" className="btn-loja" title={v.price}>{v.type}</a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'.85rem', color:'rgba(26,39,68,.7)' }}>{p.price}</span>
                      <a href={`/?product=${p.id}`} target="_blank" className="btn-loja">Ver na loja</a>
                    </div>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop:'6rem', paddingTop:'3rem', borderTop:'1px solid rgba(212,168,67,.15)' }}>
          <p style={{ fontFamily:'var(--font-bebas)', fontSize:'.85rem', letterSpacing:'4px', color:'var(--gold)', opacity:.6, marginBottom:'1.5rem' }}>★ Outras coleções ★</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.75rem' }}>
            {collections.filter((c: any) => c.slug !== slug).map((c: any) => (
              <Link key={c.id} href={`/colecao/${c.slug}`} className="other-col-link">{c.name}</Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
