import { getBlogPosts } from '@/lib/db'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — Ô bicha!',
  description: 'Coleções, causas sociais, projetos e tudo que move a Ô bicha!.',
  openGraph: {
    title: 'Blog — Ô bicha!',
    description: 'Coleções, causas sociais, projetos e tudo que move a Ô bicha!.',
    url: 'https://obicha.com.br/blog',
  },
}

export default async function BlogPage() {
  const posts = await getBlogPosts(true) as any[]

  return (
    <>
      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --red-deep:#8B1A10; --gold:#D4A843; --sidebar:220px; }
        *, *::before, *::after { box-sizing:border-box; }
        body { margin:0; background:var(--navy); color:var(--creme); font-family:var(--font-dm),sans-serif; }

        .sidebar {
          position:fixed; top:0; left:0; bottom:0; width:var(--sidebar);
          background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2);
          display:flex; flex-direction:column; z-index:200;
        }
        .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; }
        .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(242,235,217,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .sidebar-link:hover, .sidebar-link.active { color:var(--gold); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .sidebar-link svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; opacity:.7; }
        .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; transition:all .3s; }
        .sidebar-cta:hover { background:var(--gold); color:var(--navy); }

        .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; }

        .blog-header { margin-bottom:4rem; }
        .blog-eyebrow { font-family:var(--font-bebas); font-size:.85rem; letter-spacing:5px; color:var(--gold); display:block; margin-bottom:.5rem; }
        .blog-title { font-family:var(--font-playfair); font-size:clamp(2.5rem,5vw,4rem); font-weight:900; line-height:1; margin:0 0 1rem; }
        .blog-title em { color:var(--red); font-style:italic; }

        .posts-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px,1fr)); gap:2rem; }

        .post-card { background:rgba(255,255,255,.03); border:1px solid rgba(212,168,67,.15); border-radius:4px; overflow:hidden; transition:all .4s; text-decoration:none; color:inherit; display:block; }
        .post-card:hover { border-color:var(--gold); transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,.4); }
        .post-card-cover { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; background:rgba(255,255,255,.05); }
        .post-card-cover-placeholder { width:100%; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.04); }
        .post-card-body { padding:1.5rem; }
        .post-card-date { font-family:var(--font-bebas); font-size:.75rem; letter-spacing:3px; color:var(--gold); opacity:.7; margin-bottom:.5rem; }
        .post-card-title { font-family:var(--font-playfair); font-size:1.2rem; font-weight:700; margin:0 0 .8rem; line-height:1.3; }
        .post-card-excerpt { font-size:.9rem; opacity:.6; line-height:1.7; margin:0 0 1.2rem; }
        .post-card-cta { font-family:var(--font-bebas); font-size:.8rem; letter-spacing:2px; color:var(--gold); }

        .empty-state { text-align:center; padding:6rem 2rem; opacity:.3; }
        .empty-state p:first-child { font-size:3rem; margin-bottom:1rem; }

        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/#manifesto" className="sidebar-link">
            <svg viewBox="0 0 20 20"><path d="M3 5h14M3 9h10M3 13h12M3 17h8"/></svg>Manifesto
          </Link>
          <Link href="/#produtos" className="sidebar-link">
            <svg viewBox="0 0 20 20"><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></svg>Produtos
          </Link>
          <Link href="/#compromissos" className="sidebar-link">
            <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>Missão
          </Link>
          <Link href="/#amargen" className="sidebar-link">
            <svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/></svg>Causa
          </Link>
          <Link href="/#social" className="sidebar-link">
            <svg viewBox="0 0 20 20"><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M7 9l6-3M7 11l6 3"/></svg>Redes
          </Link>
          <Link href="/blog" className="sidebar-link active">
            <svg viewBox="0 0 20 20"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg>Blog
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <a href="https://umapenca.com/obicha/" target="_blank" className="sidebar-cta">Entrar na Loja</a>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="blog-header">
          <span className="blog-eyebrow">★ Deboche com conteúdo ★</span>
          <h1 className="blog-title">O que a gente<br /><em>tem a dizer.</em></h1>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <p>✍️</p>
            <p>Primeiros posts chegando em breve.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="post-card">
                {post.cover_image
                  ? <img src={post.cover_image} alt={post.title} className="post-card-cover" />
                  : <div className="post-card-cover-placeholder">
                      <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="rgba(212,168,67,.3)" strokeWidth="1.2" strokeLinecap="round"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg>
                    </div>
                }
                <div className="post-card-body">
                  <div className="post-card-date">
                    {new Date(post.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
                  </div>
                  <h2 className="post-card-title">{post.title}</h2>
                  {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
                  <span className="post-card-cta">Ler mais →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
