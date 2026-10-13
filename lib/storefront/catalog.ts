export type Variant = { type: string; link: string; price: string; image?: string | null; active?: boolean; available?: boolean }
export type Design = { id: number; aliases: number[]; name: string; originalName: string; image: string; referenceType: string; slug?:string|null; collections: string[]; variants: Variant[] }
export type SourceProduct = { id: number; name: string; category?: string; price?: string; link?: string; image_url?: string | null; manual_variants?: unknown; collection_name?: string | null; collections?: { name: string }[]; catalog_group_id?: number | null; slug?:string|null; hidden?:boolean }
export function supplier(link: string) {
  try { const u = new URL(link); if(u.protocol !== 'https:' || u.username || u.password) return null;
    if(['lojareservaink.obicha.com.br','www.reserva.ink','reserva.ink'].includes(u.hostname))return 'reserva';
    if(['lojaumapenca.obicha.com.br','umapenca.com','www.umapenca.com'].includes(u.hostname))return 'penca';
  } catch {} return null;
}
export function variants(value: unknown): Variant[] {
  if(typeof value === 'string') {try {value=JSON.parse(value)}catch{return []}}
  return Array.isArray(value) ? value.filter(v => v && typeof v.type==='string' && typeof v.link==='string').map(v=>({type:v.type,link:v.link,price:v.price || '',image:v.image_url || v.image || null, active:v.active !== false, available:v.available !== false})) : [];
}
export function model(category = '') {
 const c=category.toLowerCase();
 const names: Record<string,string>={camisetas:'Camiseta',camiseta:'Camiseta',regata:'Regata',cropped:'Cropped',oversized:'Camiseta Oversized',peruano:'Camiseta Algodão Peruano',algodao_peruano:'Camiseta Algodão Peruano','cropped-moletom':'Cropped Moletom',hoodie:'Hoodie Moletom',sueter:'Suéter Moletom',infantil:'Camiseta Infantil',estonada:'Camiseta Estonada',dryfit:'Camiseta Dry Fit',moletom:'Hoodie Moletom',ecobags:'Ecobag',ecobag:'Ecobag',canecas:'Caneca',caneca:'Caneca',bottoms:'Bottons',bottons:'Bottons'};
 return names[c] || category || 'Camiseta';
}
function safeImage(value: string | null | undefined) {try{return value && new URL(value).protocol==='https:' ? value : '/Logo_-_O_Bicha.png'}catch{return '/Logo_-_O_Bicha.png'}}
function dedupe(items: Variant[]) {return items.filter((v,i,a)=>supplier(v.link) && a.findIndex(x=>x.link===v.link)===i)}
export function buildCatalog(source: SourceProduct[]): Design[] {
 const groups=new Map<number,SourceProduct[]>();
 for(const p of source){const id=p.catalog_group_id || p.id;groups.set(id,[...(groups.get(id)||[]),p]);}
 return [...groups.entries()].flatMap(([id,group])=>{
  const p=group.find(p=>p.id===id)||group[0];
  if(p.hidden)return [];
  const options=group.filter(row=>row.id===p.id).flatMap(p=>{
   const stored=variants(p.manual_variants);
   return stored.length ? stored.map(v=>v.link===p.link&&p.price?.trim()?{...v,price:p.price}:v) : p.link ? [{type:model(p.category),link:p.link,price:p.price||'',image:null}] : [];
  });
  const valid=dedupe(options.filter(v=>v.active!==false && v.available!==false)).sort((a,b)=>Number(supplier(a.link)==='penca')-Number(supplier(b.link)==='penca'));
  if(!valid.length)return [];
  return [{id:p.id,aliases:group.map(p=>p.id),name:p.name,originalName:p.name,slug:p.slug||null,image:safeImage(p.image_url),referenceType:model(p.category),collections:[...new Set(group.flatMap(p=>[...(p.collections?.map(c=>c.name)||[]),...(p.collection_name?[p.collection_name]:[])]))],variants:valid.map(v=>({...v,image:v.image?safeImage(v.image):null}))}];
 });
}
