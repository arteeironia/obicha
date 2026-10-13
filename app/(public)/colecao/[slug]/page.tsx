import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductsByCollection, getCollections } from '@/lib/db-collections'
import DiscoverySchema from '@/components/storefront/DiscoverySchema'
import {CatalogCards} from '@/components/storefront/CatalogCards'
import {buildCatalog} from '@/lib/storefront/catalog'
import {getProductsWithCollections} from '@/lib/db-collections'

export const dynamic = 'force-dynamic'

const collectionMeta: Record<string, { title: string; description: string }> = {
  'fetiche':     { title: 'Camisetas Fetiche — Coleção Fetiche', description: 'Conheça as estampas da Coleção Fetiche da Ô bicha!. Explore referências da comunidade, compare modelos e siga para a loja parceira.' },
  'bear':        { title: 'Camisetas Bear — Coleção Bear', description: 'Explore a Coleção Bear da Ô bicha!: estampas com corpos bears, cultura pop e orgulho. Compare modelos disponíveis e escolha sua peça.' },
  'queer':       { title: 'Coleção Queer', description: 'Camisetas da coleção Queer da Ô bicha! — moda queer brasileira com estilo.' },
  'pride':       { title: 'Camisetas Pride — Orgulho LGBT', description: 'Coleção Pride da Ô bicha!: estampas com orgulho LGBTQ+ para a Parada e o cotidiano. Confira as peças e os modelos disponíveis.' },
  'raca':        { title: 'Coleção Raça', description: 'Camisetas da coleção Raça da Ô bicha! — representatividade e resistência.' },
  'diversidade': { title: 'Coleção Diversidade', description: 'Camisetas da coleção Diversidade da Ô bicha! — celebrando quem você é.' },
  'cultura-pop': { title: 'Coleção Cultura Pop', description: 'Camisetas da coleção Cultura Pop da Ô bicha! — referências que você ama.' },
  'ironicas':    { title: 'Coleção Irônicas', description: 'Camisetas da coleção Irônicas da Ô bicha! — humor e deboche fino.' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const collections=await getCollections() as any[];
  const collection=collections.find(c=>c.slug===slug);if(!collection)return {};
  const meta = collectionMeta[slug]||{title:`Coleção ${collection.name}`,description:`Explore as estampas e os modelos disponíveis na coleção ${collection.name} da Ô bicha!.`}
  return {
    title: `${meta.title} — Ô bicha!`,
    description: meta.description,
    alternates: { canonical: `https://www.obicha.com.br/colecao/${slug}` },
  }
}

const catLabel = (cat: string) => ({
  camisetas: 'Camiseta Algodão', estonada: 'Camiseta Estonada', dryfit: 'Dry Fit',
  modal: 'Modal Tech', canecas: 'Caneca', ecobags: 'Ecobag', bottoms: 'Bottom'
}[cat] || cat)

export default async function ColecaoPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const collections=await getCollections() as any[];
 const collection=collections.find(c=>c.slug===slug);if(!collection)notFound();
 const source=await getProductsWithCollections();
 const products=buildCatalog(source).filter(p=>p.collections.includes(collection.name));
 return <main className="wrap content-page"><DiscoverySchema name={collection.name} path={'/colecao/'+encodeURIComponent(slug)} products={products}/><p className="eyebrow">COLEÇÕES Ô BICHA!</p><h1>{collection.name}</h1><p>{collectionMeta[slug]?.description||`Encontre sua estampa na coleção ${collection.name}.`}</p><nav className="collection-chips" aria-label="Outras coleções">{collections.map(c=><Link key={c.id} href={'/colecao/'+encodeURIComponent(c.slug)} aria-current={c.slug===slug?'page':undefined}>{c.name}</Link>)}</nav>{slug==='bear'&&<section className="discovery-copy"><h2>Cultura bear, do nosso jeito</h2><p>Corpos bears e referências da cultura pop se encontram nesta coleção. Abra uma estampa para ver a arte, comparar as peças disponíveis e escolher o modelo que combina com você.</p><p>A mesma ilustração pode aparecer em diferentes roupas ou acessórios. Cada opção identifica a parceira responsável pela produção, pelo pedido e pela entrega.</p></section>}<p>{products.length} estampas disponíveis</p><div className="product-grid"><CatalogCards products={products}/></div><Link className="button navy" href="/#vitrine">Ver todas as estampas</Link></main>
}
