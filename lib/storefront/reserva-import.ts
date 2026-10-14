import {parseReservaFeed} from './reserva-feed'
export const reservaFeedUrl='https://reserva.ink/user/dashboard/export_csv.google_tsv_store_feed_200568'
export function validateReservaLink(link:string){const u=new URL(link);if(u.protocol!=='https:'||u.hostname!=='lojareservaink.obicha.com.br'||u.username||u.password||!u.pathname.startsWith('/obichacamisetas/product/'))throw new Error('Use um link de produto da sua loja Reserva Ink.');return u.href}
export function parseReservaProduct(html:string,link:string){
 const blocks=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
 const nodes=blocks.flatMap(b=>{try{const x=JSON.parse(b[1]);return Array.isArray(x)?x:x['@graph']||[x]}catch{return []}});
 const p=nodes.find(x=>x['@type']==='Product');if(!p)throw new Error('A página não forneceu dados de produto.');
 const offer=Array.isArray(p.offers)?p.offers[0]:p.offers;
 if(!p.name||!offer||offer.priceCurrency!=='BRL'||!(Number(offer.price)>0))throw new Error('Produto sem preço válido.');
 const type=String(p.category||'Camiseta');const name=String(p.name).replace(new RegExp('^'+type+'\\s+','i'),'');
 const image=Array.isArray(p.image)?p.image[0]:p.image;
 return {name,category:'camisetas',price:Number(offer.price).toFixed(2).replace('.',','),link,image_url:typeof image==='string'?image:'',description:String(p.description||''),manual_variants:[{type,link,price:Number(offer.price).toFixed(2).replace('.',','),image_url:typeof image==='string'?image:'',active:true,available:/\/InStock$/.test(offer.availability||''),pending_until:new Date(Date.now()+48*3600000).toISOString()}]};
}
export async function readReservaProduct(link:string){link=validateReservaLink(link);const r=await fetch(link,{cache:'no-store',redirect:'error',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Não foi possível consultar esse produto.');return parseReservaProduct(await r.text(),link)}
export async function readReservaFeed(){const r=await fetch(reservaFeedUrl,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Não foi possível consultar o catálogo da Reserva.');return parseReservaFeed(await r.text())}
