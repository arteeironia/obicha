import { getProducts, getSocialPosts, getPinterestPins, getSiteConfig, getHighlights } from '@/lib/db'
import LandingClient from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

type Product = { id: number; name: string; category: string; price: string; link: string; image_url: string | null; description: string | null; featured: boolean; collection_name: string | null }
type SocialPost = { id: number; platform: string; url: string }
type PinterestPin = { id: number; image_url: string; pin_url: string | null }
type HImage = { id: number; image_url: string; position: number }
type Highlight = { id: number; type: string; title: string; original_price: string | null; promo_price: string | null; expires_at: string | null; link: string | null; images: HImage[] | null }

export default async function Home() {
  const [products, socialPosts, pinterestPins, siteConfig, highlights] = await Promise.all([
    getProducts(),
    getSocialPosts(),
    getPinterestPins(),
    getSiteConfig(),
    getHighlights(true),
  ])

  return (
    <LandingClient
      products={products as Product[]}
      socialPosts={socialPosts as SocialPost[]}
      pinterestPins={pinterestPins as PinterestPin[]}
      siteConfig={siteConfig}
      highlights={highlights as Highlight[]}
    />
  )
}
