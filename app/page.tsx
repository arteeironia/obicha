import { getProducts, getSocialPosts, getPinterestPins, getSiteConfig, getCollections } from '@/lib/db'
import LandingClient from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

type Product = { id: number; name: string; category: string; price: string; link: string; image_url: string | null }
type SocialPost = { id: number; platform: string; url: string }
type PinterestPin = { id: number; image_url: string; pin_url: string | null }
type Collection = { id: number; title: string; description: string | null; image_url: string | null; link: string }

export default async function Home() {
  const [products, socialPosts, pinterestPins, siteConfig, collections] = await Promise.all([
    getProducts(),
    getSocialPosts(),
    getPinterestPins(),
    getSiteConfig(),
    getCollections(),
  ])

  return (
    <LandingClient
      products={products as Product[]}
      socialPosts={socialPosts as SocialPost[]}
      pinterestPins={pinterestPins as PinterestPin[]}
      siteConfig={siteConfig}
      collections={collections as Collection[]}
    />
  )
}
