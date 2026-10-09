import verified from './verified-catalog.json'
export type Variant = { type: string; link: string; price: string; image?: string | null }
export type Design = { id: number; aliases: number[]; name: string; originalName: string; image: string; referenceType: string; collections: string[]; variants: Variant[] }
export type SourceProduct = { id: number; name: string; category?: string; price?: string; link?: string; image_url?: string | null; manual_variants?: unknown; collection_name?: string | null; collections?: { name: string }[] }
export function supplier(link: string) {
  try { const u = new URL(link); if(u.protocol !== 'https:' || u.username || u.password) return null;
    if(['lojareservaink.obicha.com.br','www.reserva.ink','reserva.ink'].includes(u.hostname))return 'reserva';
    if(['lojaumapenca.obicha.com.br','umapenca.com','www.umapenca.com'].includes(u.hostname))return 'penca';
  } catch {} return null;
}
function variants(value: unknown): Variant[] {
  if(typeof value === 'string') {try {value=JSON.parse(value)}catch{return []}}
  return Array.isArray(value) ? value.filter(v => v && typeof v.type==='string' && typeof v.link==='string').map(v=>({type:v.type,link:v.link,price:v.price || '',image:v.image_url || v.image || null})) : [];
}
function signature(p: SourceProduct) {return [p.link,p.category,p.price,variants(p.manual_variants).map(v=>[v.type,v.link,v.price||''])]}
function model(category = '') {
 const c=category.toLowerCase();
 const names: Record<string,string>={camisetas:'Camiseta',camiseta:'Camiseta',regata:'Regata',cropped:'Cropped',oversized:'Camiseta Oversized',peruano:'Camiseta Algodão Peruano',algodao_peruano:'Camiseta Algodão Peruano','cropped-moletom':'Cropped Moletom',hoodie:'Hoodie Moletom',sueter:'Suéter Moletom',infantil:'Camiseta Infantil',estonada:'Camiseta Estonada',dryfit:'Camiseta Dry Fit',moletom:'Hoodie Moletom',ecobags:'Ecobag',ecobag:'Ecobag',canecas:'Caneca',caneca:'Caneca',bottoms:'Bottons',bottons:'Bottons'};
 return names[c] || category || 'Camiseta';
}
function safeImage(value: string | null | undefined) {try{return value && new URL(value).protocol==='https:' ? value : '/Logo_-_O_Bicha.png'}catch{return '/Logo_-_O_Bicha.png'}}
function dedupe(items: Variant[]) {return items.filter((v,i,a)=>supplier(v.link) && a.findIndex(x=>x.link===v.link)===i)}
export function buildCatalog(source: SourceProduct[]): Design[] {
 const live=new Map(source.map(p=>[p.id,p]));const handled=new Set<number>();const output:Design[]=[];
 for(const p of source) {
  if(handled.has(p.id))continue;
  const baseline=verified.find(v=>v.source_ids.includes(p.id));
  // Only supplement an unchanged, verified record. Admin edits always take priority.
  const unchanged=baseline && baseline.sourceRecords.every(r=>live.has(r.id) && JSON.stringify(signature(live.get(r.id)!))===JSON.stringify(r.signature));
  const group=unchanged ? baseline.source_ids.map(id=>live.get(id)!) : [p];
  group.forEach(s=>handled.add(s.id));
  const options=unchanged ? baseline.variants : dedupe((p.link ? [{type:model(p.category),link:p.link,price:p.price||'',image:null}] : []).concat(variants(p.manual_variants) as any));
  const valid=dedupe(options);
  if(!valid.length)continue;
  const name=unchanged && p.name===baseline.sourceRecords.find(r=>r.id===p.id)?.name ? baseline.name : p.name;
  output.push({id:unchanged ? baseline.id : p.id,aliases:group.map(s=>s.id),name,originalName:p.name,image:safeImage(p.image_url || (unchanged ? baseline.image : null)),referenceType:model(p.category),collections:[...new Set(group.flatMap(s=>s.collections?.map(c=>c.name) || (s.collection_name ? [s.collection_name] : [])))],variants:valid.map(v=>({...v,image:v.image ? safeImage(v.image) : null}))});
 }
 return output;
}
