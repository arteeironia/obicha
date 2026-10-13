import { MetadataRoute } from 'next'
import {getCollections} from '@/lib/db-collections'
import {buildCatalog} from '@/lib/storefront/catalog'
import { getProducts, getBlogPosts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await getProducts() as any[]).filter(p=>buildCatalog([p]).length)
  const collections=await getCollections() as any[]
  const posts = await getBlogPosts() as any[]

  const staticPages = [
    { url: 'https://www.obicha.com.br', changeFrequency: 'weekly' as const, priority: 1 },
    { url: 'https://www.obicha.com.br/blog', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: 'https://www.obicha.com.br/parcerias', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: 'https://www.obicha.com.br/projeto-social', changeFrequency: 'monthly' as const, priority: 0.5 },
    // Páginas de descoberta, também ligadas pela navegação.
    { url: 'https://www.obicha.com.br/camisetas-lgbt', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: 'https://www.obicha.com.br/moda-queer', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: 'https://www.obicha.com.br/camiseta-orgulho-gay', changeFrequency: 'weekly' as const, priority: 0.9 },
  ]

  const blogPages = posts.map((post: any) => ({
    url: `https://www.obicha.com.br/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const productPages = products
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      url: `https://www.obicha.com.br/produtos/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticPages, { url: 'https://www.obicha.com.br/produtos', changeFrequency: 'weekly' as const, priority: 0.9 }, ...collections.map(c=>({url:'https://www.obicha.com.br/colecao/'+encodeURIComponent(c.slug),changeFrequency:'weekly' as const,priority:0.8})), ...productPages, ...blogPages]
}
