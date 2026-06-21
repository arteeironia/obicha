import type { Metadata } from 'next'
import { getProducts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Moda Queer Brasileira — Camisetas e Roupas LGBTQ+ | Ô bicha!',
  description: 'Moda queer feita no Brasil. Camisetas, ecobags e canecas com estampas que falam por você. Expressão, identidade e resistência em cada peça. Conheça a Ô bicha!',
  keywords: ['moda queer', 'roupa queer Brasil', 'camiseta queer', 'moda LGBTQ', 'roupa LGBT Brasil', 'estampa queer', 'moda alternativa gay'],
  alternates: { canonical: 'https://obicha.com.br/moda-queer' },
}

export default async function ModaQueer() {
  const products = await getProducts()
  const featured = (products as any[]).slice(0, 8)

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem', fontFamily: 'var(--font-dm, sans-serif)', color: '#1A2744' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
        Moda Queer Brasileira — Expressão sem Filtro
      </h1>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 700 }}>
        A <strong>Ô bicha!</strong> é moda queer feita no Brasil — para quem vive a identidade sem pedir permissão.
        Camisetas, ecobags, canecas e bottoms com estampas que gritam o que você sente.
        Porque moda também é posicionamento, e a Ô bicha! não tem medo de ser o que é.
      </p>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        O que é moda queer?
      </h2>
      <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
        Moda queer é expressão. É recusar a norma e criar o próprio estilo com coragem.
        É usar a roupa como linguagem política, afetiva e cultural. Na Ô bicha!, cada peça carrega
        uma história — de resistência, de orgulho e de muito deboche fino.
      </p>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Destaques da coleção
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {featured.map((p: any) => (
          <div key={p.id}>
            {p.image_url && <img src={p.image_url} alt={`Moda queer ${p.name}`} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 4 }} />}
            <p style={{ fontWeight: 700, marginTop: '.5rem' }}>{p.name}</p>
            <p style={{ color: '#C0281C', fontWeight: 700 }}>{p.price}</p>
            <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '.5rem', padding: '.4rem 1rem', background: '#C0281C', color: 'white', textDecoration: 'none', fontSize: '.85rem', borderRadius: 2 }}>
              Ver na loja
            </a>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Moda queer com impacto social
      </h2>
      <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>
        Comprar na Ô bicha! é mais do que estilo. Parte de cada venda vai para grupos de apoio LGBTQ+.
        Sua escolha de moda financia resistência real — nas ruas, nas periferias e nos espaços de acolhimento.
      </p>

      <p style={{ fontSize: '.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <a href="https://obicha.com.br" style={{ color: '#C0281C' }}>← Voltar para a Ô bicha!</a>
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Moda Queer Brasileira — Ô bicha!",
        "description": "Moda queer feita no Brasil. Camisetas e roupas LGBTQ+ com estampas de expressão e resistência.",
        "url": "https://obicha.com.br/moda-queer",
        "provider": { "@type": "Organization", "name": "Ô bicha!", "url": "https://obicha.com.br" }
      })}} />
    </main>
  )
}
