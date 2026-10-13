import type {Metadata} from 'next'
import Link from 'next/link'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog} from '@/lib/storefront/catalog'
import {modelFamily} from '@/lib/storefront/visibility'
import {CatalogCards} from '@/components/storefront/CatalogCards'
import DiscoverySchema from '@/components/storefront/DiscoverySchema'
import DiscoveryLinks from '@/components/storefront/DiscoveryLinks'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Camiseta Orgulho Gay — Para a Parada e o Dia a Dia | Ô bicha!',description:'Camisetas com orgulho gay e LGBTQ+: encontre sua estampa para a Parada e o dia a dia. Veja modelos, medidas e lojas parceiras da Ô bicha!.',alternates:{canonical:'https://www.obicha.com.br/camiseta-orgulho-gay'}}
export default async function CamisetaOrgulhoGay(){
 const all=buildCatalog(await getProductsWithCollections());
 const products=all.filter(p=>p.collections.some(c=>/pride|orgulho/i.test(c))).map(p=>({...p,variants:p.variants.filter(v=>['cotton','peruvian','oversized','tank','dryfit'].includes(modelFamily(v.type)))})).filter(p=>p.variants.length);
 return <main className="wrap content-page discovery-page"><DiscoverySchema name="Camiseta orgulho gay" path="/camiseta-orgulho-gay" products={products}/><p className="eyebrow">ORGULHO SEM DATA MARCADA</p><h1>Camiseta orgulho gay.<br/><em>Para a Parada e para a vida.</em></h1><p className="discovery-intro">Escolha uma estampa com orgulho LGBTQ+ para ocupar a rua, encontrar os amigos ou vestir no dia a dia. Na Ô bicha!, você encontra referências da comunidade e compara as peças disponíveis antes de comprar.</p><section><h2>Estampas com orgulho</h2>{products.length?<div className="product-grid"><CatalogCards products={products}/></div>:<p>Explore a coleção Pride para conferir as opções disponíveis.</p>}<Link className="text-link" href="/colecao/pride">Explorar a coleção Pride</Link></section><section className="discovery-copy"><h2>Escolher uma peça para a Parada</h2><p>Pense no caimento que você prefere e confira as medidas do modelo. Camiseta de algodão, oversized e regata têm cortes diferentes; não presuma que o mesmo tamanho veste igual em todas as peças.</p><p>A disponibilidade depende da estampa e da loja parceira. Na página do produto, confira tamanho, cor, frete e prazo para a ocasião em que pretende usar.</p><Link className="button navy" href="/#modelos">Comparar os modelos</Link></section><DiscoveryLinks/><section className="discovery-copy"><h2>Conheça o propósito da Ô bicha!</h2><p>Orgulho, deboche e resistência fazem parte da marca. Os detalhes da ação social vinculada às compras pela Uma Penca estão na página do projeto.</p><Link className="text-link" href="/projeto-social">Como funciona o projeto social</Link></section></main>
}
