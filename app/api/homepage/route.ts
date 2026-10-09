import {NextRequest,NextResponse} from 'next/server'
import {isAdmin} from '@/lib/admin-access'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog,type SourceProduct} from '@/lib/storefront/catalog'
import {resolveContent} from '@/lib/storefront/content'
import {readHome} from '@/lib/homepage-store'
export const dynamic='force-dynamic'
export async function GET(request:NextRequest) {
 const preview=request.nextUrl.searchParams.get('preview')==='1';
 if(preview&&!await isAdmin(request))return NextResponse.json({error:'Prévia disponível apenas no admin.'},{status:401,headers:{'Cache-Control':'private, no-store'}});
 const products=buildCatalog(await getProductsWithCollections() as SourceProduct[]);const {state}=await readHome(products);
 return NextResponse.json(resolveContent(preview?state.draft:state.published,products,preview),{headers:{'Cache-Control':'private, no-store'}});
}
