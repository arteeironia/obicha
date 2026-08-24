import Link from 'next/link'

export const metadata = {
  title: 'Voto que Representa — Eleições 2026 | Ô bicha!',
  description: 'Conheça as candidaturas LGBT+ nas eleições de 2026. Voto consciente também é resistência.',
  alternates: { canonical: 'https://www.obicha.com.br/vote-lgbt' },
}

export default function VoteLgbtPage() {
  return (
    <>
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
        .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; transition:all .3s; }
        .sidebar-cta:hover { background:var(--gold); color:var(--navy); }
        .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; }
        .content { max-width:760px; }
        .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--gold); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .back-link:hover { opacity:1; }
        .stat-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; padding:1.5rem; }
        .btn-cta { display:inline-block; padding:1rem 2.2rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:1.05rem; text-decoration:none; border-radius:2px; transition:all .3s; }
        .btn-cta:hover { background:var(--gold); color:var(--navy); transform:translateY(-2px); }
        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/#produtos" className="sidebar-link">Produtos</Link>
          <Link href="/blog" className="sidebar-link">Blog</Link>
          <Link href="/projeto-social" className="sidebar-link">Projeto Social</Link>
          <Link href="/vote-lgbt" className="sidebar-link" style={{ color: 'var(--gold)' }}>Voto que Representa</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link href="/produtos" className="sidebar-cta">Ver Produtos</Link>
        </div>
      </aside>

      <main className="main">
        <Link href="/" className="back-link">← Voltar</Link>

        <div className="content">
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '.85rem', letterSpacing: '5px', color: 'var(--gold)', display: 'block', marginBottom: '.5rem', opacity: .7 }}>★ 2026 ★</span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.3rem,5.5vw,3.6rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem' }}>
            Voto que representa
          </h1>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.75, opacity: .85, marginBottom: '2rem', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
            A gente estampa orgulho na camiseta. Mas representatividade também se constrói na urna.
          </p>

          <p style={{ lineHeight: 1.8, opacity: .8, marginBottom: '1.2rem' }}>
            Nas eleições de 2026, as candidaturas LGBT+ vivem um momento histórico: um levantamento do Instituto Plena Cidadania mostra que o número de nomes autodeclarados quase dobrou em proporção desde 2022 — hoje uma em cada 40 candidaturas no Brasil é LGBT+, contra uma em cada 90 há quatro anos.
          </p>

          <p style={{ lineHeight: 1.8, opacity: .8, marginBottom: '2.5rem' }}>
            Isso não acontece sozinho. Acontece porque gente como você decide se informar, apoiar e votar em quem entende a nossa pauta por dentro. O <b>VoteLGBT</b>, iniciativa que existe desde 2014, mantém um mapeamento nacional dessas candidaturas — com nome, cargo, partido e as bandeiras que cada uma defende.
          </p>

          <div className="stat-card" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1.5rem', textAlign: 'center' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.2rem', color: 'var(--gold)' }}>500+</p>
                <p style={{ fontSize: '.8rem', opacity: .6 }}>candidaturas LGBT+ confirmadas</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.2rem', color: 'var(--gold)' }}>57%</p>
                <p style={{ fontSize: '.8rem', opacity: .6 }}>de crescimento desde 2022</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.2rem', color: 'var(--gold)' }}>2,5%</p>
                <p style={{ fontSize: '.8rem', opacity: .6 }}>do universo eleitoral em 2026</p>
              </div>
            </div>
            <p style={{ fontSize: '.7rem', opacity: .4, marginTop: '1rem', textAlign: 'center' }}>
              Fonte: Instituto Plena Cidadania / VoteLGBT, dados de agosto de 2026
            </p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <a href="https://2026.votelgbt.org/candidaturas" target="_blank" rel="noopener noreferrer" className="btn-cta">
              Ver candidaturas no VoteLGBT ↗
            </a>
            <p style={{ fontSize: '.78rem', opacity: .4, marginTop: '1rem', fontStyle: 'italic', fontFamily: 'var(--font-playfair)' }}>
              Você sai do nosso site — o cadastro completo é mantido pelo VoteLGBT, não por nós.
            </p>
          </div>

          <p style={{ lineHeight: 1.8, opacity: .6, fontSize: '.9rem', borderTop: '1px solid rgba(212,168,67,.15)', paddingTop: '2rem' }}>
            A Ô bicha! não recebe nada em troca dessa indicação e não tem qualquer vínculo político-partidário. A gente só acredita que quem estampa orgulho na camiseta também pode levar orgulho pra urna.
          </p>
        </div>
      </main>
    </>
  )
}
