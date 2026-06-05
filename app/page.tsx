import { getProducts, getSocialPosts, getPinterestPins, getSiteConfig, getFeaturedProducts } from '@/lib/db'
import LandingClient from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

type Product = { id: number; name: string; category: string; price: string; link: string; image_url: string | null; description: string | null; featured: boolean; collection_name: string | null }
type SocialPost = { id: number; platform: string; url: string }
type PinterestPin = { id: number; image_url: string; pin_url: string | null }

export default async function Home() {
  const [products, socialPosts, pinterestPins, siteConfig, featuredProducts] = await Promise.all([
    getProducts(),
    getSocialPosts(),
    getPinterestPins(),
    getSiteConfig(),
    getFeaturedProducts(),
  ])

  return (
    <LandingClient
      products={products as Product[]}
      socialPosts={socialPosts as SocialPost[]}
      pinterestPins={pinterestPins as PinterestPin[]}
      siteConfig={siteConfig}
      featuredProducts={featuredProducts as Product[]}
    />
  )
}
