import { Metadata } from 'next'
import Link from 'next/link'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog} from '@/lib/storefront/catalog'
import {CatalogCards} from '@/components/storefront/CatalogCards'

export const dynamic = 'force-dynamic'



export const metadata: Metadata = {
  title: 'Produtos — Camisetas LGBT, Gay e Queer | Ô bicha!',
  description: 'Todas as estampas da Ô bicha! — camisetas, ecobags, canecas e mais, com orgulho, deboche e resistência. Moda LGBT feita no Brasil.',
  alternates: { canonical: 'https://www.obicha.com.br/produtos' },
}

export default async function ProdutosPage(){
 const products=buildCatalog(await getProductsWithCollections());
 return <main className="wrap content-page"><p className="eyebrow">CATÁLOGO Ô BICHA!</p><h1>Encontre sua estampa.</h1><p>Escolha o modelo e siga para a loja que produz a peça.</p><div className="product-grid"><CatalogCards products={products}/></div><Link href="/#vitrine" className="button navy">Buscar e comparar modelos</Link></main>
}
