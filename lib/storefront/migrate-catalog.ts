import postgres from 'postgres'
import {planCatalogMigration} from './catalog-migration-plan'
const sql=postgres(process.env.DATABASE_URL!,{ssl:'require'})
let ready:Promise<void>|undefined
// The historical file is used once for migration, never for live catalog rendering.
export function ensureCatalog(){
 return ready ||= migrate().catch(error=>{ready=undefined;throw error})
}
async function migrate(){
 await sql.begin(async tx=>{
  await tx`SELECT pg_advisory_xact_lock(68412793)`
  await tx`CREATE TABLE IF NOT EXISTS catalog_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW(), backup JSONB NOT NULL)`
  await tx`CREATE TABLE IF NOT EXISTS catalog_sync_state (source TEXT PRIMARY KEY, attempted_at TIMESTAMPTZ NOT NULL, succeeded_at TIMESTAMPTZ, error TEXT)`
  await tx`ALTER TABLE catalog_migrations ENABLE ROW LEVEL SECURITY`
  await tx`ALTER TABLE catalog_sync_state ENABLE ROW LEVEL SECURITY`
  await tx`REVOKE ALL PRIVILEGES ON catalog_migrations, catalog_sync_state FROM PUBLIC, anon, authenticated`
  await tx`ALTER TABLE products ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE`
  if((await tx`SELECT id FROM catalog_migrations WHERE id='database-catalog-v1'`).length)return
  await tx`ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_group_id INTEGER`
  const rows=await tx`SELECT * FROM products FOR UPDATE`
  await tx`INSERT INTO catalog_migrations (id,backup) VALUES ('database-catalog-v1',${tx.json(rows as any)})`
  for(const update of planCatalogMigration(rows as any[])){
   await tx`UPDATE products SET manual_variants=${tx.json(update.variants)}, name=${update.name}, price=${update.price}, catalog_group_id=${update.id} WHERE id=${update.id}`
   for(const id of update.aliases.filter((id:number)=>id!==update.id)){
    await tx`UPDATE products SET catalog_group_id=${update.id} WHERE id=${id}`
    await tx`INSERT INTO product_collections (product_id,collection_id) SELECT ${update.id},collection_id FROM product_collections WHERE product_id=${id} ON CONFLICT DO NOTHING`
   }
  }
 })
}
