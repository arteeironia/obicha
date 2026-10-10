import {getBlogPosts,getHighlights,getSocialPosts,getPinterestPins,getSiteConfig} from '@/lib/db'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog,type SourceProduct} from '@/lib/storefront/catalog'
import {readHome} from '@/lib/homepage-store'
import {resolveContent} from '@/lib/storefront/content'
import {isAdmin} from '@/lib/admin-access'
import {redirect} from 'next/navigation'
import Vitrine from '@/components/storefront/Vitrine'
import Reviews from '@/components/reviews/Reviews'
import {readReviews} from '@/lib/reviews-store'
export const dynamic='force-dynamic'
export async function generateMetadata({searchParams}:{searchParams:Promise<{preview?:string}>}) {
 return (await searchParams).preview==='1'?{robots:{index:false,follow:false}}:{};
}
export default async function Home({searchParams}:{searchParams:Promise<{preview?:string}>}) {
 const preview=(await searchParams).preview==='1';
 if(preview&&!await isAdmin())redirect('/admin/login');
 const [source,posts,highlights,social,pins,config]=await Promise.all([getProductsWithCollections(),getBlogPosts(),getHighlights(true),getSocialPosts(),getPinterestPins(),getSiteConfig()]);
 const products=buildCatalog(source as SourceProduct[]);
 if(!products.length)return <main className="wrap content-page"><h1>Nossa vitrine está sendo preparada.</h1><p>Confira as novidades nas redes da Ô bicha!.</p></main>;
 const {state}=await readHome(products);
 const {state:reviewState}=await readReviews();
 const reviews=reviewState.enabled?reviewState.reviews.filter(r=>!reviewState.hiddenIds.includes(r.id)):[];
 return <><Vitrine products={products} content={resolveContent(preview?state.draft:state.published,products,preview)} posts={posts} highlights={highlights} social={social} pins={pins} config={config} reviews={reviews}/><Reviews/></>;
}

