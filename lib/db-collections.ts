import {refreshReservaCatalog} from './storefront/sync-reserva'
import {buildCatalog} from './storefront/catalog'
import {ensureCatalog} from './storefront/migrate-catalog'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada')
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

export async function getCollections() {
  return sql`SELECT * FROM collections ORDER BY name ASC`
}

export async function getProductCollections(productId: number) {
  return sql`SELECT collection_id FROM product_collections WHERE product_id = ${productId}`
}

export async function setProductCollections(productId: number, collectionIds: number[]) {
  await sql`DELETE FROM product_collections WHERE product_id = ${productId}`
  if (collectionIds.length > 0) {
    for (const cid of collectionIds) {
      await sql`INSERT INTO product_collections (product_id, collection_id) VALUES (${productId}, ${cid}) ON CONFLICT DO NOTHING`
    }
  }
}

export async function getProductsByCollection(slug: string) {
  await ensureCatalog()
  const rows=await sql`
    SELECT p.* FROM products p
    INNER JOIN product_collections pc ON pc.product_id = p.id
    INNER JOIN collections c ON c.id = pc.collection_id
    WHERE c.slug = ${slug} AND (p.catalog_group_id IS NULL OR p.catalog_group_id=p.id)
    ORDER BY p.created_at DESC`
  return rows.flatMap(p=>{const design=buildCatalog([p as any])[0];if(!design)return [];const chosen=design.variants.find(v=>v.link===p.link)||design.variants[0];return [{...p,link:chosen.link,price:chosen.price,manual_variants:design.variants.map(v=>({...v,image_url:v.image}))}]})
}

export async function getProductsWithCollections(refresh=true) {
  if(refresh)await refreshReservaCatalog();else await ensureCatalog()
  const products = await sql`SELECT * FROM products ORDER BY created_at DESC`
  const relations = await sql`
    SELECT pc.product_id, c.id, c.name, c.slug
    FROM product_collections pc
    INNER JOIN collections c ON c.id = pc.collection_id`

  return (products as any[]).map(p => ({
    ...p,
    collections: (relations as any[]).filter(r => r.product_id === p.id).map(r => ({ id: r.id, name: r.name, slug: r.slug }))
  }))
}
