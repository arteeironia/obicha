import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Camiseta Orgulho Gay — Para a Parada e o Dia a Dia | Ô bicha!',
  description: 'Camisetas orgulho gay com estampas exclusivas. Perfeitas para a Parada LGBT de São Paulo e para quem vive o orgulho todos os dias. Compre na Ô bicha! — feito no Brasil.',
  keywords: ['camiseta orgulho gay', 'camiseta parada gay', 'camiseta pride', 'camiseta parada LGBT São Paulo', 'roupa orgulho gay', 'camiseta gay São Paulo'],
  alternates: { canonical: 'https://obicha.com.br/camiseta-orgulho-gay' },
}

export default function CamisetaOrgulhoGay() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem', fontFamily: 'var(--font-dm, sans-serif)', color: '#1A2744' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
        Camiseta Orgulho Gay — Para a Parada e Para a Vida
      </h1>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 700 }}>
        O orgulho não é só um dia por ano. Na <strong>Ô bicha!</strong>, criamos <strong>camisetas orgulho gay</strong>
        para quem vive a diversidade 365 dias — na Parada, no trabalho, na balada e em casa.
        Estampas com atitude, tecido de qualidade e consciência social em cada ponto.
      </p>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Camisetas para a Parada do Orgulho LGBT de São Paulo
      </h2>
      <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
        A <strong>Parada LGBT de São Paulo</strong> é uma das maiores do mundo e acontece anualmente na Avenida Paulista.
        Para esse momento histórico, você merece uma peça que diga tudo sem precisar falar —
        uma camiseta que é manifesto, declaração e estilo ao mesmo tempo.
      </p>
      <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>
        Nossas camisetas orgulho gay são feitas com <strong>100% algodão sustentável</strong> e <strong>impressão DTG premium</strong>,
        garantindo durabilidade, cores vibrantes e conforto mesmo nos dias mais longos de festa e luta.
      </p>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Tipos de camisetas disponíveis
      </h2>
      <ul style={{ lineHeight: 2, paddingLeft: '1.5rem', marginBottom: '2rem' }}>
        <li><strong>Camiseta Algodão Orgulho Gay</strong> — clássica, confortável, para o dia a dia</li>
        <li><strong>Camiseta Estonada Gay</strong> — visual vintage, toque macio e caimento exclusivo</li>
        <li><strong>Dry Fit LGBT</strong> — para quem leva o orgulho até no treino</li>
        <li><strong>Modal Tech Gay</strong> — ultraconfortável para uso prolongado</li>
      </ul>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, margin: '2rem 0 1rem' }}>
        Orgulho com impacto real
      </h2>
      <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>
        Cada camiseta orgulho gay vendida na Ô bicha! destina parte do valor para grupos de apoio LGBTQ+.
        Você usa, você apoia, você transforma. Isso é orgulho de verdade.
      </p>

      <a href="https://umapenca.com/obicha/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#C0281C', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', borderRadius: 2, marginBottom: '2rem' }}>
        Ver todas as camisetas →
      </a>

      <p style={{ fontSize: '.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <a href="https://obicha.com.br" style={{ color: '#C0281C' }}>← Voltar para a Ô bicha!</a>
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Camiseta Orgulho Gay — Ô bicha!",
        "description": "Camisetas orgulho gay com estampas exclusivas. Perfeitas para a Parada LGBT de São Paulo.",
        "url": "https://obicha.com.br/camiseta-orgulho-gay",
        "provider": { "@type": "Organization", "name": "Ô bicha!", "url": "https://obicha.com.br" }
      })}} />
    </main>
  )
}
