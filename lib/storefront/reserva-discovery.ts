import {designKey,feedModel,parseReservaFeed} from './reserva-feed'
import {variants,type SourceProduct} from './catalog'

// Match supplier identities, never editable display names. Hidden rows and legacy
// aliases count as known so automatic discovery cannot recreate a paused design.
export function discoverReservaDesigns(rows:SourceProduct[],feed:ReturnType<typeof parseReservaFeed>){
 const known=new Set(rows.flatMap(p=>[designKey(p.link||''),...variants(p.manual_variants).map(v=>designKey(v.link))]).filter(Boolean));
 const groups=new Map<string,Record<string,string>[]>();
 for(const entry of feed.values()){
  const key=designKey(entry.link);
  if(!key||known.has(key))continue;
  const group=groups.get(key)||[];group.push(entry);groups.set(key,group);
 }
 return [...groups.entries()].map(([key,entries])=>{
  const options=entries.map(e=>({type:feedModel(e.title),link:e.link,price:e.price.replace(/\s*BRL$/,'').replace('.',','),image_url:e.image_link||null,active:true,available:!['out of stock','out_of_stock','discontinued'].includes(e.availability?.toLowerCase()),pending_until:e.pending_until,availability_source:'reserva' as const}));
  const representative=options.find(v=>v.available&&v.type==='Camiseta')||options.find(v=>v.available)||options[0];
  const entry=entries.find(e=>e.link===representative.link)!;
  const name=(entry.title.split(' - ').slice(1).join(' - ')||entry.title).trim().slice(0,255);
  if(!name||options.some(v=>!v.type||!/^\d+(?:[.,]\d+)?$/.test(v.price)||!(Number(v.price.replace(',','.'))>0)))throw new Error('A Reserva retornou uma estampa nova sem nome, modelo ou preço válido. Catálogo preservado.');
  return {key,name,link:representative.link,price:representative.price,image_url:representative.image_url,description:entry.description||'',manual_variants:options};
 });
}
