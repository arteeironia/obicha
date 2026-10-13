import type {Design} from '@/lib/storefront/catalog'
export function CatalogCards({products}:{products:Design[]}){
 return <>{products.map(p=><article className="product-card" key={p.id}>
  <a href={p.variants[0].link} data-product={p.id} className="product-image" aria-label={`Escolher peça de ${p.name}`}><img src={p.image} alt={`Estampa ${p.name}`} width={600} height={600} loading="lazy"/><span className="image-action">Ver opções ↗</span></a>
  <div className="product-info"><p className="product-collection">{p.collections.join(' · ')||'Ô bicha!'}</p><h3><a href={p.variants[0].link} data-product={p.id}>{p.name}</a></h3><div className="product-models">{[...new Set(p.variants.map(v=>v.type))].map(type=><span key={type}>{type}</span>)}</div>
  <details className="catalog-direct-options"><summary>Modelos e lojas</summary>{p.variants.map(v=><p key={v.link}><a href={v.link} rel="noopener noreferrer">{v.type} · {v.link.includes('reserva')?'Reserva Ink':'Uma Penca'} · {v.price?.trim()||'Preço na loja'}</a></p>)}</details></div>
 </article>)}</>
}
