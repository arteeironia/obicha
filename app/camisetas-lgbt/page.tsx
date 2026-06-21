import type { Metadata } from 'next'
import { getProducts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Camisetas LGBT — Estampas com Orgulho e Resistência | Ô bicha!',
  description: 'Camisetas LGBT feitas no Brasil com orgulho. Estampas exclusivas para a comunidade gay, lésbica, queer e trans. 100% algodão sustentável, impressão DTG premium. Compre agora na Ô bicha!',
  keywords: ['camiseta LGBT', 'camiseta gay', 'camiseta orgulho LGBT', 'camiseta LGBTQ Brasil', 'moda LGBT', 'roupa gay', 'camiseta queer'],
  openGraph: {
    title: 'Camisetas LGBT — Ô bicha!',
    description: 'Estampas com orgulho, deboche e resistência. Feitas no Brasil.',
    url: 'https://obicha.com.br/camisetas-lgbt',
  },
  alternates: { canonical: 'https://obicha.com.br/camisetas-lgbt' },
}

export default async function CamisetasLGBT() {
  const products = await getProducts()
  const lgbtProducts = (products as any[]).filter(p =>
    ['camisetas', 'estonada', 'dryfit', 'modal'].includes(p.category)
  )

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem', fontFamily: 'var(--font-dm, sans-serif)', color: '#1A2744' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
        Camisetas LGBT — Orgulho, Deboche e Resistência
      </h1>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 700 }}>
        A <strong>Ô bicha!</strong> cria camisetas LGBT feitas no Brasil com 100% algodão sustentável e impressão DTG premium.
        Cada estampa é um manifesto portátil — para quem ocupa as ruas com marra, representatividade e muito deboche fino.
        Perfeitas para a <strong>Parada LGBT</strong>, o dia a dia e cada momento em que você quer mostrar quem é.
      </p>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Por que escolher a Ô bicha!?
      </h2>
      <ul style={{ lineHeight: 2, paddingLeft: '1.5rem', marginBottom: '2rem' }}>
        <li>Estampas exclusivas criadas por e para a comunidade LGBTQ+</li>
        <li>100% algodão sustentável com selo PETA Cruelty Free</li>
        <li>Impressão DTG premium — cores vibrantes, toque zero</li>
        <li>Disponível em Algodão, Estonada, Dry Fit e Modal Tech</li>
        <li>Parte das vendas vai para grupos sociais LGBTQ+</li>
      </ul>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Nossas Camisetas LGBT
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {lgbtProducts.map((p: any) => (
          <div key={p.id}>
            {p.image_url && (
              <img src={p.image_url} alt={`Camiseta LGBT ${p.name}`} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 4 }} />
            )}
            <p style={{ fontWeight: 700, marginTop: '.5rem' }}>{p.name}</p>
            <p style={{ color: '#C0281C', fontWeight: 700 }}>{p.price}</p>
            <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '.5rem', padding: '.4rem 1rem', background: '#C0281C', color: 'white', textDecoration: 'none', fontSize: '.85rem', borderRadius: 2 }}>
              Ver na loja
            </a>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Camisetas LGBT para cada ocasião
      </h2>
      <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
        Seja para a <strong>Parada do Orgulho LGBT de São Paulo</strong>, para festas, para o trabalho ou para o dia a dia,
        a Ô bicha! tem a estampa certa para você. Nossas camisetas gay e queer são pensadas para quem não tem medo de ocupar espaço.
      </p>
      <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>
        Explore também nossas <strong>camisetas estonadas LGBT</strong>, <strong>dry fit</strong> e <strong>modal tech</strong>
        — cada tecido com sua personalidade, todas com o mesmo compromisso: orgulho sem pedir licença.
      </p>

      <p style={{ fontSize: '.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <a href="https://obicha.com.br" style={{ color: '#C0281C' }}>← Voltar para a Ô bicha!</a>
      </p>

      {/* Schema markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Camisetas LGBT — Ô bicha!",
        "description": "Camisetas LGBT feitas no Brasil com orgulho. Estampas exclusivas para a comunidade gay, lésbica, queer e trans.",
        "url": "https://obicha.com.br/camisetas-lgbt",
        "provider": {
          "@type": "Organization",
          "name": "Ô bicha!",
          "url": "https://obicha.com.br"
        }
      })}} />
    </main>
  )
}
