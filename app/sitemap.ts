import { MetadataRoute } from 'next'
import { getProducts, getBlogPosts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts() as any[]
  const posts = await getBlogPosts() as any[]

  const staticPages = [
    { url: 'https://obicha.com.br', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: 'https://obicha.com.br/blog', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: 'https://obicha.com.br/parcerias', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: 'https://obicha.com.br/projeto-social', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    // Páginas SEO escondidas
    { url: 'https://obicha.com.br/camisetas-lgbt', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: 'https://obicha.com.br/moda-queer', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: 'https://obicha.com.br/camiseta-orgulho-gay', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  ]

  const blogPages = posts.map((post: any) => ({
    url: `https://obicha.com.br/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages]
}
