import {CatalogCards} from '@/components/storefront/CatalogCards'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog} from '@/lib/storefront/catalog'
import {modelFamily} from '@/lib/storefront/visibility'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import postgres from 'postgres'
import ZoomableProductImage from '@/components/ZoomableProductImage'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [category] = await sql`SELECT * FROM categories WHERE value = ${slug} AND active = true`
  if (!category) return {}
  return {
    title: `${category.label} — Ô bicha!`,
    description: `Confira todos os produtos da categoria ${category.label} da Ô bicha! — moda LGBT com orgulho, deboche e resistência.`,
    alternates: { canonical: `https://www.obicha.com.br/categoria/${slug}` },
  }
}

const supplierLabel = (s: string | null) => {
  if (s === 'reserva-ink-dtg') return '✦ Reserva INK · DTG · Qualidade Reserva'
  if (s === 'uma-penca-dtf') return '✦ Uma Penca · DTF · Qualidade Chico Rei'
  return null
}

// Categoria (slug do site) -> nome do tipo de variante correspondente
const CATEGORY_TO_VARIANT_TYPE: Record<string, string> = {
  camisetas: 'Camiseta',
  estonada: 'Estonada',
  dryfit: 'Dry Fit',
  modal: 'Modal Tech',
  peruano: 'Camiseta Algodão Peruano',
  oversized: 'Camiseta Oversized',
  regata: 'Regata',
  cropped: 'Cropped',
  'cropped-moletom': 'Cropped Moletom',
  infantil: 'Camiseta Infantil',
  hoodie: 'Hoodie Moletom',
  sueter: 'Suéter Moletom',
  bones: 'Boné',
  canecas: 'Caneca',
  ecobags: 'Ecobag',
  bottoms: 'Kit de Bottons',
}

function parseVariants(mv: any): { type: string; price: string; link: string; image_url?: string }[] {
  if (typeof mv === 'string') { try { mv = JSON.parse(mv) } catch { return [] } }
  return Array.isArray(mv) ? mv : []
}

export default async function CategoriaPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const [category]=await sql`SELECT * FROM categories WHERE value=${slug} AND active=true`;
 if(!category)notFound();
 const target=CATEGORY_TO_VARIANT_TYPE[slug]||category.label;
 const all=buildCatalog(await getProductsWithCollections());
 const products=all.map(p=>({...p,variants:p.variants.filter(v=>v.type===target||modelFamily(v.type)===modelFamily(target))})).filter(p=>p.variants.length);
 return <main className="wrap content-page"><p className="eyebrow">PEÇAS Ô BICHA!</p><h1>{category.label}</h1><p>{products.length} estampas com modelos disponíveis.</p><div className="product-grid"><CatalogCards products={products}/></div><Link className="button navy" href="/#vitrine">Comparar todos os modelos</Link></main>
}
