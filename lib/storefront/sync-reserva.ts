import postgres from 'postgres'
import {createHash} from 'node:crypto'
import {discoverReservaDesigns} from './reserva-discovery'
import {includeRecentReserva} from './reserva-recent'
import {invalidateProductCache} from '../db'
import {ensureCatalog} from './migrate-catalog'
import {parseReservaFeed,reconcileReserva,productKey,findReservaVariant} from './reserva-feed'
import {variants,type SourceProduct} from './catalog'
const sql=postgres(process.env.DATABASE_URL!,{ssl:'require'})
const url='https://reserva.ink/user/dashboard/export_csv.google_tsv_store_feed_200568'
export async function refreshReservaCatalog(force=false){
 await ensureCatalog();
 const claimed=await sql`INSERT INTO catalog_sync_state (source,attempted_at) VALUES ('reserva-auto-v3',NOW()) ON CONFLICT (source) DO UPDATE SET attempted_at=NOW() WHERE ${force} OR catalog_sync_state.attempted_at<NOW()-INTERVAL '1 hour' RETURNING source`;
 if(!claimed.length)return {updated:0,unavailable:0,skipped:true};
 try{
  const response=await fetch(url,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error(`A Reserva respondeu ${response.status}. Nenhum produto foi alterado.`);
  const feed=parseReservaFeed(await response.text());
  await ensureCatalog();
  const snapshot=await sql`SELECT * FROM products`;
  const discoveryFeed=await includeRecentReserva(snapshot as unknown as SourceProduct[],feed);
  const result=await sql.begin(async tx=>{
   await tx`SELECT pg_advisory_xact_lock(68412793)`;
   const rows=await tx`SELECT * FROM products FOR UPDATE`;
   const oldKeys=[...new Set(rows.flatMap(p=>variants(p.manual_variants).filter(v=>v.available!==false&&v.availability_source!=='manual').map(v=>productKey(v.link)).filter(Boolean)))];
   const missing=oldKeys.filter(key=>!feed.has(key!)&&!rows.some(p=>variants(p.manual_variants).some(v=>productKey(v.link)===key&&findReservaVariant(v.link,v.type,feed))));
   if(oldKeys.length>10&&missing.length/oldKeys.length>.2)throw new Error('Mais de 20% das opções da Reserva sumiram do arquivo. Atualização interrompida para proteger o catálogo. Confira a loja antes de tentar novamente.');
   let updated=0,unavailable=0;
   for(const p of rows.filter(p=>!p.catalog_group_id||p.catalog_group_id===p.id)){
    const options=reconcileReserva(p as SourceProduct,feed);
    if(!options.some(v=>productKey(v.link)))continue;
    const representative=options.find(v=>v.link===p.link&&v.available!==false&&v.active!==false)||options.find(v=>v.available!==false&&v.active!==false);
    await tx`UPDATE products SET manual_variants=${tx.json(options)},price=${representative?.price||''},link=${representative?.link||p.link},updated_at=NOW() WHERE id=${p.id}`;
    updated++;unavailable+=options.filter(v=>productKey(v.link)&&v.available===false).length;
   }
   const discovered=discoverReservaDesigns(rows as unknown as SourceProduct[],discoveryFeed);
   for(const p of discovered){
    const slug='reserva-'+createHash('sha256').update(p.key).digest('hex').slice(0,24);
    await tx`INSERT INTO products (name,category,price,link,image_url,description,featured,supplier,show_on_site,manual_variants,slug,hidden)
     VALUES (${p.name},'camisetas',${p.price},${p.link},${p.image_url},${p.description},FALSE,'reserva',TRUE,${tx.json(p.manual_variants)},${slug},FALSE)`;
   }
   return {updated,unavailable,imported:discovered.length,importedModels:discovered.reduce((n,p)=>n+p.manual_variants.length,0)};
  });
  await sql`UPDATE catalog_sync_state SET succeeded_at=NOW(),error=NULL WHERE source='reserva-auto-v3'`;
  invalidateProductCache();
  return result;
 }catch(error){
  await sql`UPDATE catalog_sync_state SET error=${error instanceof Error?error.message:'Falha na sincronização'} WHERE source='reserva-auto-v3'`;
  if(force)throw error;
  return {updated:0,unavailable:0,failed:true};
 }
}
export async function reservaSyncStatus(){await ensureCatalog();const [state]=await sql`SELECT attempted_at,succeeded_at,error FROM catalog_sync_state WHERE source='reserva-auto-v3'`;return state||null}
