import {isAdmin} from '@/lib/admin-access'
import {redirect} from 'next/navigation'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog,type SourceProduct} from '@/lib/storefront/catalog'
import AdminVitrine from '@/components/storefront/AdminVitrine'
export const dynamic='force-dynamic'
export default async function AdminPage(){
 if(!await isAdmin())redirect('/admin/login');
 const products=buildCatalog(await getProductsWithCollections() as SourceProduct[]);
 return products.length?<AdminVitrine products={products}/>:<p>Cadastre um produto com um link válido da loja parceira antes de editar a vitrine.</p>;
}
