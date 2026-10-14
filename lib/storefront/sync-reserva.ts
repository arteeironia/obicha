import postgres from 'postgres'
import {ensureCatalog} from './migrate-catalog'
import {parseReservaFeed,reconcileReserva,productKey,findReservaVariant} from './reserva-feed'
import {variants,type SourceProduct} from './catalog'
const sql=postgres(process.env.DATABASE_URL!,{ssl:'require'})
const url='https://reserva.ink/user/dashboard/export_csv.google_tsv_store_feed_200568'
export async function refreshReservaCatalog(force=false){
 await ensureCatalog();
 const claimed=await sql`INSERT INTO catalog_sync_state (source,attempted_at) VALUES ('reserva-links-v2',NOW()) ON CONFLICT (source) DO UPDATE SET attempted_at=NOW() WHERE ${force} OR catalog_sync_state.attempted_at<NOW()-INTERVAL '1 hour' RETURNING source`;
 if(!claimed.length)return {updated:0,unavailable:0,skipped:true};
 try{
  const response=await fetch(url,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error(`A Reserva respondeu ${response.status}. Nenhum produto foi alterado.`);
  const feed=parseReservaFeed(await response.text());
  await ensureCatalog();
  const result=await sql.begin(async tx=>{
   await tx`SELECT pg_advisory_xact_lock(68412793)`;
   const rows=await tx`SELECT * FROM products WHERE catalog_group_id IS NULL OR catalog_group_id=id FOR UPDATE`;
   const oldKeys=[...new Set(rows.flatMap(p=>variants(p.manual_variants).filter(v=>v.available!==false&&v.availability_source!=='manual').map(v=>productKey(v.link)).filter(Boolean)))];
   const missing=oldKeys.filter(key=>!feed.has(key!)&&!rows.some(p=>variants(p.manual_variants).some(v=>productKey(v.link)===key&&findReservaVariant(v.link,v.type,feed))));
   if(oldKeys.length>10&&missing.length/oldKeys.length>.2)throw new Error('Mais de 20% das opções da Reserva sumiram do arquivo. Atualização interrompida para proteger o catálogo. Confira a loja antes de tentar novamente.');
   let updated=0,unavailable=0;
   for(const p of rows){
    const options=reconcileReserva(p as SourceProduct,feed);
    if(!options.some(v=>productKey(v.link)))continue;
    const representative=options.find(v=>v.link===p.link&&v.available!==false&&v.active!==false)||options.find(v=>v.available!==false&&v.active!==false);
    await tx`UPDATE products SET manual_variants=${tx.json(options)},price=${representative?.price||''},link=${representative?.link||p.link},updated_at=NOW() WHERE id=${p.id}`;
    updated++;unavailable+=options.filter(v=>productKey(v.link)&&v.available===false).length;
   }
   return {updated,unavailable};
  });
  await sql`UPDATE catalog_sync_state SET succeeded_at=NOW(),error=NULL WHERE source='reserva-links-v2'`;
  return result;
 }catch(error){
  await sql`UPDATE catalog_sync_state SET error=${error instanceof Error?error.message:'Falha na sincronização'} WHERE source='reserva-links-v2'`;
  if(force)throw error;
  return {updated:0,unavailable:0,failed:true};
 }
}
export async function reservaSyncStatus(){await ensureCatalog();const [state]=await sql`SELECT attempted_at,succeeded_at,error FROM catalog_sync_state WHERE source='reserva-links-v2'`;return state||null}
