import {readReservaProduct,validateReservaLink} from './reserva-import'
import {designKey,productKey,parseReservaFeed} from './reserva-feed'
import {variants,type SourceProduct} from './catalog'

export function recentReservaLinks(html:string){
 const links=new Set<string>();
 for(const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  let data;try{data=JSON.parse(match[1])}catch{continue}
  const nodes=Array.isArray(data)?data:data['@graph']||[data];
  for(const node of nodes){
   if(node['@type']!=='ItemList')continue;
   for(const item of node.itemListElement||[]){
    const url=item.url||item.item?.url;
    try{links.add(validateReservaLink(url))}catch{}
   }
  }
 }
 return [...links];
}
// The export can lag behind the public store. Read its recent-products listing
// and enrich only designs missing from both the database and the export.
export async function includeRecentReserva(rows:SourceProduct[],feed:ReturnType<typeof parseReservaFeed>){
 const response=await fetch('https://lojareservaink.obicha.com.br/obichacamisetas/products?assortment=recent',{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Não foi possível conferir os lançamentos na loja Reserva. Catálogo preservado.');
 const links=recentReservaLinks(await response.text());
 if(!links.length)throw new Error('A Reserva não forneceu a lista de lançamentos. Catálogo preservado.');
 const known=new Set([...rows.flatMap(p=>[designKey(p.link||''),...variants(p.manual_variants).map(v=>designKey(v.link))]),...Array.from(feed.values(),e=>designKey(e.link))]);
 const missing=links.filter(link=>!known.has(designKey(link)));
 const enriched=new Map(feed);
 for(let i=0;i<missing.length;i+=4){
  const products=await Promise.all(missing.slice(i,i+4).map(readReservaProduct));
  for(const p of products){const v=p.manual_variants[0];enriched.set(productKey(p.link)!,{id:p.link,title:v.type+' - '+p.name,link:p.link,price:v.price,image_link:p.image_url,description:p.description,availability:v.available?'in stock':'out of stock',pending_until:v.pending_until});}
 }
 return enriched;
}
