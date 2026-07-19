import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductsByCollection, getCollections } from '@/lib/db-collections'

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
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --red-deep:#8B1A10; --gold:#D4A843; --sidebar:220px; }
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
        .product-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; transition:all .4s; }
        .product-card:hover { border-color:var(--gold); transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,.4); }
        .btn-loja { padding:.4rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:1px; font-size:.8rem; text-decoration:none; border-radius:2px; transition:background .3s; }
        .btn-loja:hover { background:var(--gold); }
        .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--gold); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .back-link:hover { opacity:1; }
        .col-tag { font-size:.68rem; color:rgba(212,168,67,.5); text-decoration:none; letter-spacing:1px; transition:color .3s; }
        .col-tag:hover { color:var(--gold); }
        .other-col-link { padding:.5rem 1.2rem; border:1px solid rgba(212,168,67,.3); color:rgba(242,235,217,.6); text-decoration:none; font-family:var(--font-bebas); letter-spacing:2px; font-size:.85rem; transition:all .25s; }
        .other-col-link:hover { border-color:var(--gold); color:var(--gold); }
        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/#produtos" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></svg>Produtos</Link>
          <Link href="/blog" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg>Blog</Link>
          <Link href="/parcerias" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 15a4 4 0 00-8 0v1h8v-1z"/></svg>Parcerias</Link>
        </nav>
        <div className="sidebar-bottom">
          <a href="https://umapenca.com/obicha/" target="_blank" className="sidebar-cta">Entrar na Loja</a>
        </div>
      </aside>

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
            {products.map((p: any) => (
              <div key={p.id} className="product-card">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width:'100%', aspectRatio:1, objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', aspectRatio:1, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.05)', fontSize:'3rem', opacity:.3 }}>👕</div>
                }
                <div style={{ padding:'1.2rem' }}>
                  <div style={{ fontFamily:'var(--font-bebas)', fontSize:'.7rem', letterSpacing:'3px', color:'var(--gold)', marginBottom:'.3rem' }}>{catLabel(p.category)}</div>
                  <div style={{ fontFamily:'var(--font-playfair)', fontSize:'1.05rem', fontWeight:700, marginBottom:'.8rem', lineHeight:1.3 }}>{p.name}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'.85rem', color:'rgba(242,235,217,.6)' }}>{p.price}</span>
                    <a href={p.link} target="_blank" className="btn-loja">Ver na loja</a>
                  </div>
                </div>
              </div>
            ))}
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
