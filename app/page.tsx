import { getSocialPosts, getPinterestPins, getSiteConfig, getHighlights } from '@/lib/db'
import postgres from 'postgres'
import LandingClient from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

type FeedVariant = { id: number; variant_type: string; price: string; link: string }
type FeedProduct = { id: number; source: string; name: string; description: string | null; image_url: string | null; scene_image_url: string | null; variants: FeedVariant[] }
type SocialPost = { id: number; platform: string; url: string }
type PinterestPin = { id: number; image_url: string; pin_url: string | null }
type HImage = { id: number; image_url: string; position: number }
type Highlight = { id: number; type: string; title: string; original_price: string | null; promo_price: string | null; expires_at: string | null; link: string | null; images: HImage[] | null }
type Category = { id: number; value: string; label: string; active: boolean }

export default async function Home() {
  const [socialPosts, pinterestPins, siteConfig, highlights, categories, feedProducts, manualProducts] = await Promise.all([
    getSocialPosts(),
    getPinterestPins(),
    getSiteConfig(),
    getHighlights(true),
    sql`SELECT * FROM categories WHERE active = true ORDER BY position ASC`,
    sql`
      SELECT fp.*, json_agg(fv.* ORDER BY fv.variant_type ASC) FILTER (WHERE fv.id IS NOT NULL) as variants
      FROM feed_products fp
      LEFT JOIN feed_variants fv ON fv.feed_product_id = fp.id
      WHERE fp.active = true
      GROUP BY fp.id
      ORDER BY fp.name ASC`,
    sql`SELECT * FROM products WHERE show_on_site = true ORDER BY created_at DESC`,
  ])

  // Converter produtos manuais para o formato FeedProduct
  const manualAsFeed: FeedProduct[] = (manualProducts as any[]).map(p => {
    let mv: any = p.manual_variants
    if (typeof mv === 'string') { try { mv = JSON.parse(mv) } catch { mv = [] } }
    if (!Array.isArray(mv)) mv = []
    return {
      id: p.id + 100000, // offset para não colidir com IDs do feed
      source: 'manual',
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      scene_image_url: null,
      variants: mv.length
        ? mv.map((v: any, i: number) => ({ id: i, variant_type: v.type || v.variant_type || 'Ver na loja', price: v.price || '', link: v.link || p.link }))
        : [{ id: 0, variant_type: 'Ver na loja', price: p.price, link: p.link }]
    }
  })

  const allProducts = [...(feedProducts as unknown as FeedProduct[]), ...manualAsFeed]

  return (
    <LandingClient
      feedProducts={allProducts}
      socialPosts={socialPosts as unknown as SocialPost[]}
      pinterestPins={pinterestPins as unknown as PinterestPin[]}
      siteConfig={siteConfig}
      highlights={highlights as unknown as Highlight[]}
      categories={categories as unknown as Category[]}
    />
  )
}
