import BlogComments from '@/components/blog/BlogComments'
import { getBlogPostBySlug } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ShareCopyBtn } from '@/components/blog/ShareButtons'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug) as any
  if (!post) return {}
  return {
    title: `${post.title} — Ô bicha!`,
    description: post.excerpt || post.title,
    openGraph: {
      title: `${post.title} — Ô bicha!`,
      description: post.excerpt || '',
      url: `https://obicha.com.br/blog/${post.slug}`,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug) as any
  if (!post || !post.published) notFound()

  return (
    <>
      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --gold:#D4A843; --sidebar:220px; }
        *, *::before, *::after { box-sizing:border-box; }
        body { margin:0; background:var(--navy); color:var(--creme); font-family:var(--font-dm),sans-serif; }
        .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar); background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2); display:flex; flex-direction:column; z-index:200; }
        .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; }
        .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(242,235,217,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .sidebar-link:hover, .sidebar-link.active { color:var(--gold); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .sidebar-link svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; opacity:.7; }
        .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .sidebar-cta { display:block; text-align:center; padding:.75rem 1rem; background:var(--red); color:var(--creme); font-family:var(--font-bebas); letter-spacing:2px; font-size:.9rem; text-decoration:none; transition:all .3s; }
        .sidebar-cta:hover { background:var(--gold); color:var(--navy); }
        .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; max-width:calc(var(--sidebar) + 800px); }
        .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--gold); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .back-link:hover { opacity:1; }
        .post-cover { width:100%; max-height:480px; object-fit:cover; border-radius:4px; margin-bottom:3rem; display:block; }
        .post-eyebrow { font-family:var(--font-bebas); font-size:.8rem; letter-spacing:4px; color:var(--gold); opacity:.7; margin-bottom:.8rem; display:block; }
        .post-title { font-family:var(--font-playfair); font-size:clamp(2rem,5vw,3.5rem); font-weight:900; line-height:1.1; margin:0 0 1.5rem; }
        .post-divider { height:1px; background:linear-gradient(to right, var(--gold), transparent); margin:2rem 0; opacity:.3; }
        .post-content { font-size:1.05rem; line-height:1.9; color:rgba(242,235,217,.85); }
        .post-content p { margin:0 0 1.4rem; }
        .post-content h2 { font-family:var(--font-playfair); font-size:1.6rem; font-weight:700; color:var(--gold); margin:2.5rem 0 1rem; }
        .post-content h3 { font-family:var(--font-playfair); font-size:1.2rem; font-weight:700; margin:2rem 0 .8rem; }
        .post-content strong { color:var(--creme); }
        .post-content em { color:var(--gold); font-style:italic; }
        .post-content a { color:var(--gold); }
        .post-content blockquote { border-left:4px solid var(--gold); padding-left:1.5rem; margin:2rem 0; font-family:var(--font-playfair); font-style:italic; font-size:1.15rem; color:var(--gold); opacity:.9; }
        .post-content img { max-width:100%; border-radius:4px; margin:1.5rem 0; }
        .share-section { margin-top:4rem; padding-top:2rem; border-top:1px solid rgba(212,168,67,.15); }
        .share-label { font-family:var(--font-bebas); font-size:.85rem; letter-spacing:3px; color:var(--gold); opacity:.7; display:block; margin-bottom:1rem; }
        .share-btns { display:flex; gap:1rem; flex-wrap:wrap; }
        .share-btn { padding:.6rem 1.4rem; font-family:var(--font-bebas); letter-spacing:2px; font-size:.85rem; text-decoration:none; border:1px solid; transition:all .3s; cursor:pointer; background:transparent; }
        .share-btn.whatsapp { color:#25D366; border-color:#25D366; }
        .share-btn.whatsapp:hover { background:#25D366; color:white; }
        .share-btn.copy { color:var(--gold); border-color:var(--gold); }
        .share-btn.copy:hover { background:var(--gold); color:var(--navy); }
        @media(max-width:900px) { .sidebar { display:none; } .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/#manifesto" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M3 5h14M3 9h10M3 13h12M3 17h8"/></svg>Manifesto</Link>
          <Link href="/#produtos" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M4 7l2-3h8l2 3"/><path d="M3 7h14v10H3z"/><path d="M8 7v2a2 2 0 004 0V7"/></svg>Produtos</Link>
          <Link href="/#compromissos" className="sidebar-link"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>Missão</Link>
          <Link href="/#amargen" className="sidebar-link"><svg viewBox="0 0 20 20"><path d="M10 17S3 12.5 3 7.5A4 4 0 0110 5a4 4 0 017 2.5C17 12.5 10 17 10 17z"/></svg>Causa</Link>
          <Link href="/#social" className="sidebar-link"><svg viewBox="0 0 20 20"><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M7 9l6-3M7 11l6 3"/></svg>Redes</Link>
          <Link href="/blog" className="sidebar-link active"><svg viewBox="0 0 20 20"><path d="M4 4h12v2H4zM4 8h8v2H4zM4 12h10v2H4zM4 16h6v2H4z"/></svg>Blog</Link>
        </nav>
        <div className="sidebar-bottom">
          <a href="https://umapenca.com/obicha/" target="_blank" className="sidebar-cta">Entrar na Loja</a>
        </div>
      </aside>

      <main className="main">
        <Link href="/blog" className="back-link">← Voltar ao blog</Link>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="post-cover" />
        )}

        <span className="post-eyebrow">
          {new Date(post.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
        </span>

        <h1 className="post-title">{post.title}</h1>

        <div className="post-divider" />

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="share-section">
          <span className="share-label">★ Compartilhar ★</span>
          <div className="share-btns">
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${typeof window !== 'undefined' ? window.location.href : `https://obicha.com.br/blog/${post.slug}`}`)}`}
              target="_blank" className="share-btn whatsapp">WhatsApp</a>
            <ShareCopyBtn slug={post.slug} />
          </div>
        </div>

        <BlogComments slug={post.slug} />
      </main>
    </>
  )
}
