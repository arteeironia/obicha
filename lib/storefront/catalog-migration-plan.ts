import seed from './verified-catalog.json'
import {model,supplier,variants} from './catalog'
export function planCatalogMigration(rows:any[]){
 const updates:any[]=[];
 for(const baseline of seed){
   const group=baseline.source_ids.map(id=>rows.find(p=>p.id===id)).filter(Boolean) as any[]
   if(!group.length)continue
   const primary=group.find(p=>p.id===baseline.id)||group[0]
   const current=group.flatMap(p=>{
    const stored=variants(p.manual_variants)
    const main=p.link?{type:model(p.category),link:p.link,price:p.price||'',image:null}:null
    return main && !stored.some(v=>v.link===main.link) ? [main,...stored] : stored
   })
   // Existing edits win by link, or by supplier+model when the link was changed.
   const merged=[...current,...baseline.variants.filter(v=>!current.some(c=>c.link===v.link||(c.type===v.type&&supplier(c.link)===supplier(v.link))))]
    .filter((v,i,a)=>supplier(v.link)&&a.findIndex(c=>c.link===v.link)===i)
    .map(v=>({...v,image_url:v.image||null}))
   const old=baseline.sourceRecords.find(r=>r.id===primary.id)
   const name=old?.name===primary.name?baseline.name:primary.name
   const representative=merged.find(v=>v.link===primary.link)||merged[0];
   updates.push({id:primary.id,name,variants:merged,price:primary.price?.trim()&&primary.price.trim()!=='R$'?primary.price:representative?.price||'',aliases:group.map(p=>p.id)});
 }
 return updates;
}
