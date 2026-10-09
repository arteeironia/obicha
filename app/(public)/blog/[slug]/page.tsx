import BlogComments from '@/components/blog/BlogComments'
import { getBlogPostBySlug } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ShareButtons, ShareCopyBtn } from '@/components/blog/ShareButtons'

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
        .obicha-legacy { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --gold:#D4A843; --sidebar:220px; }
        .obicha-legacy *, .obicha-legacy *::before, .obicha-legacy *::after { box-sizing:border-box; }
        .obicha-legacy { margin:0; background:var(--cream); color:var(--ink); font-family:var(--font-dm),sans-serif; }
        .obicha-legacy .sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar); background:rgba(15,26,46,.97); border-right:1px solid rgba(212,168,67,.2); display:flex; flex-direction:column; z-index:200; }
        .obicha-legacy .sidebar-logo { padding:1.8rem 1.5rem 1.5rem; border-bottom:1px solid rgba(212,168,67,.15); }
        .obicha-legacy .sidebar-logo img { width:100%; max-width:160px; height:auto; display:block; }
        .obicha-legacy .sidebar-nav { flex:1; padding:2rem 0; display:flex; flex-direction:column; gap:.3rem; }
        .obicha-legacy .sidebar-link { display:flex; align-items:center; gap:.8rem; padding:.75rem 1.5rem; color:rgba(26,39,68,.55); text-decoration:none; font-family:var(--font-bebas); font-size:.95rem; letter-spacing:2.5px; text-transform:uppercase; border-left:3px solid transparent; transition:all .25s; }
        .obicha-legacy .sidebar-link:hover, .obicha-legacy .sidebar-link.active { color:var(--ink); border-left-color:var(--gold); background:rgba(212,168,67,.06); }
        .obicha-legacy .sidebar-link svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; opacity:.7; }
        .obicha-legacy .sidebar-bottom { padding:1.5rem; border-top:1px solid rgba(212,168,67,.15); }
        .obicha-legacy .main { margin-left:var(--sidebar); min-height:100vh; padding:5rem 4rem; max-width:calc(var(--sidebar) + 800px); }
        .obicha-legacy .back-link { display:inline-flex; align-items:center; gap:.5rem; font-family:var(--font-bebas); font-size:.85rem; letter-spacing:2px; color:var(--ink); text-decoration:none; opacity:.7; transition:opacity .3s; margin-bottom:3rem; }
        .obicha-legacy .back-link:hover { opacity:1; }
        .obicha-legacy .post-cover { width:100%; max-height:480px; object-fit:cover; border-radius:4px; margin-bottom:3rem; display:block; }
        .obicha-legacy .post-eyebrow { font-family:var(--font-bebas); font-size:.8rem; letter-spacing:4px; color:var(--ink); opacity:.7; margin-bottom:.8rem; display:block; }
        .obicha-legacy .post-title { font-family:var(--font-playfair); font-size:clamp(2rem,5vw,3.5rem); font-weight:900; line-height:1.1; margin:0 0 1.5rem; }
        .obicha-legacy .post-divider { height:1px; background:linear-gradient(to right, var(--gold), transparent); margin:2rem 0; opacity:.3; }
        .obicha-legacy .post-content { font-size:1.05rem; line-height:1.9; color:rgba(26,39,68,.85); }
        .obicha-legacy .post-content p { margin:0 0 1.4rem; }
        .obicha-legacy .post-content h2 { font-family:var(--font-playfair); font-size:1.6rem; font-weight:700; color:var(--ink); margin:2.5rem 0 1rem; }
        .obicha-legacy .post-content h3 { font-family:var(--font-playfair); font-size:1.2rem; font-weight:700; margin:2rem 0 .8rem; }
        .obicha-legacy .post-content strong { color:var(--ink); }
        .obicha-legacy .post-content em { color:var(--ink); font-style:italic; }
        .obicha-legacy .post-content a { color:var(--ink); }
        .obicha-legacy .post-content blockquote { border-left:4px solid var(--gold); padding-left:1.5rem; margin:2rem 0; font-family:var(--font-playfair); font-style:italic; font-size:1.15rem; color:var(--ink); opacity:.9; }
        .obicha-legacy .post-content img { max-width:100%; border-radius:4px; margin:1.5rem 0; }
        .obicha-legacy .share-section { margin-top:4rem; padding-top:2rem; border-top:1px solid rgba(212,168,67,.15); }
        .obicha-legacy .share-label { font-family:var(--font-bebas); font-size:.85rem; letter-spacing:3px; color:var(--ink); opacity:.7; display:block; margin-bottom:1rem; }
        .obicha-legacy .share-btns { display:flex; gap:.75rem; flex-wrap:wrap; }
        .obicha-legacy .share-btn { padding:.6rem 1.4rem; font-family:var(--font-bebas); letter-spacing:2px; font-size:.85rem; text-decoration:none; border:1px solid; transition:all .3s; cursor:pointer; background:transparent; display:inline-block; }
        .obicha-legacy .share-btn.whatsapp { color:#25D366; border-color:#25D366; }
        .obicha-legacy .share-btn.whatsapp:hover { background:#25D366; color:white; }
        .obicha-legacy .share-btn.threads { color:#F2EBD9; border-color:rgba(26,39,68,.4); }
        .obicha-legacy .share-btn.threads:hover { background:#F2EBD9; color:#1A2744; }
        .obicha-legacy .share-btn.facebook { color:#1877F2; border-color:#1877F2; }
        .obicha-legacy .share-btn.facebook:hover { background:#1877F2; color:white; }
        .obicha-legacy .share-btn.copy { color:var(--gold); border-color:var(--gold); }
        .obicha-legacy .share-btn.copy:hover { background:var(--gold); color:var(--navy); }
        .obicha-legacy .share-btn.story { color:var(--red); border-color:var(--red); }
        .obicha-legacy .share-btn.story:hover { background:var(--red); color:white; }
        .obicha-legacy .share-btn:disabled { opacity:.5; cursor:wait; }
        @media(max-width:900px) { .obicha-legacy .sidebar { display:none; } .obicha-legacy .main { margin-left:0; padding:2rem 1.5rem; } }
      `}</style>



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
            <ShareButtons slug={post.slug} title={post.title} excerpt={post.excerpt || ''} />
          </div>
        </div>

        <BlogComments slug={post.slug} />
      </main>
    </>
  )
}
