import { getProducts, getSocialPosts, getPinterestPins, getSiteConfig, getHighlights } from '@/lib/db'
import { getProductsWithCollections } from '@/lib/db-collections'
import postgres from 'postgres'
import LandingClient from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

type Product = { id: number; name: string; category: string; price: string; link: string; image_url: string | null; description: string | null; featured: boolean; collection_name: string | null; supplier: string | null; collections?: { id: number; name: string; slug: string }[] }
type SocialPost = { id: number; platform: string; url: string }
type PinterestPin = { id: number; image_url: string; pin_url: string | null }
type HImage = { id: number; image_url: string; position: number }
type Highlight = { id: number; type: string; title: string; original_price: string | null; promo_price: string | null; expires_at: string | null; link: string | null; images: HImage[] | null }
type Category = { id: number; value: string; label: string; active: boolean }

export default async function Home() {
  const [products, socialPosts, pinterestPins, siteConfig, highlights, categories] = await Promise.all([
    getProductsWithCollections(),
    getSocialPosts(),
    getPinterestPins(),
    getSiteConfig(),
    getHighlights(true),
    sql`SELECT * FROM categories WHERE active = true ORDER BY position ASC`,
  ])

  return (
    <LandingClient
      products={products as unknown as Product[]}
      socialPosts={socialPosts as unknown as SocialPost[]}
      pinterestPins={pinterestPins as unknown as PinterestPin[]}
      siteConfig={siteConfig}
      highlights={highlights as unknown as Highlight[]}
      categories={categories as unknown as Category[]}
    />
  )
}
