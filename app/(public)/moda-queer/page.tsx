import type {Metadata} from 'next'
import Link from 'next/link'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog} from '@/lib/storefront/catalog'
import {CatalogCards} from '@/components/storefront/CatalogCards'
import DiscoverySchema from '@/components/storefront/DiscoverySchema'
import DiscoveryLinks from '@/components/storefront/DiscoveryLinks'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Moda Queer Brasileira — Camisetas e Roupas LGBTQ+ | Ô bicha!',description:'Moda queer da Ô bicha!: camisetas e acessórios com cultura pop, humor e representatividade. Explore as coleções e os modelos disponíveis para cada estampa.',alternates:{canonical:'https://www.obicha.com.br/moda-queer'}}
export default async function ModaQueer(){
 const products=buildCatalog(await getProductsWithCollections());
 return <main className="wrap content-page discovery-page"><DiscoverySchema name="Moda queer brasileira" path="/moda-queer" products={products.slice(0,12)}/><p className="eyebrow">DEBOCHE, AMOR E RESISTÊNCIA</p><h1>Moda queer brasileira.<br/><em>Referências que vestem você.</em></h1><p className="discovery-intro">Camisetas, roupas e acessórios com referências da nossa cultura, diferentes corpos e orgulho LGBTQ+. Na Ô bicha!, a estampa é um jeito de dizer quem você é e do que você gosta.</p><section className="discovery-copy"><h2>O que a moda queer significa aqui?</h2><p>Você escolhe como quer se apresentar. Nossas coleções exploram cultura pop, identidade, afeto, humor e fetiche. Nenhuma peça exige um corpo ou um jeito único de ser: a referência precisa fazer sentido para você.</p></section><DiscoveryLinks/><section><h2>Estampas para descobrir</h2><div className="product-grid"><CatalogCards products={products.slice(0,12)}/></div><Link className="button navy" href="/produtos">Explorar todas as estampas</Link></section><section className="discovery-copy"><h2>A mesma arte, diferentes peças</h2><p>Cada estampa reúne os modelos disponíveis e identifica a loja responsável pela produção. Você pode comparar as opções no site; tamanho, cor, frete e pagamento são confirmados na Reserva Ink ou na Uma Penca.</p><Link className="text-link" href="/#modelos">Conhecer tecidos e modelagens</Link></section><section className="discovery-copy"><h2>Moda e posicionamento</h2><p>O propósito da Ô bicha! vai além da estampa. Conheça nossa causa e os detalhes do projeto social ligado às compras pela Uma Penca.</p><Link className="text-link" href="/projeto-social">Conhecer o projeto social</Link></section></main>
}
