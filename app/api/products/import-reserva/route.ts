import {NextRequest,NextResponse} from 'next/server'
import {isAdmin,sameOrigin} from '@/lib/admin-access'
import {getProducts} from '@/lib/db'
import {readReservaProduct,readReservaFeed} from '@/lib/storefront/reserva-import'
import {variants} from '@/lib/storefront/catalog'
import {designKey,feedModel} from '@/lib/storefront/reserva-feed'
export async function POST(request:NextRequest){
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403});
 try{
  const {link}=await request.json();const products=await getProducts();
  if(link){const product=await readReservaProduct(String(link));
   const feed=await readReservaFeed().catch(()=>null);const related=feed?[...feed.values()].filter(e=>designKey(e.link)===designKey(product.link)):[];
   if(related.length)product.manual_variants=related.map(e=>({type:feedModel(e.title),link:e.link,price:e.price.replace(/\s*BRL$/,'').replace('.',','),image_url:e.image_link,active:true,available:!['out of stock','out_of_stock','discontinued'].includes(e.availability?.toLowerCase()),pending_until:''}));
   const existing=products.find((p:any)=>variants(p.manual_variants).some(v=>designKey(v.link)===designKey(product.link))||designKey(p.link)===designKey(product.link));return NextResponse.json({product,existingId:existing?.id||null})}
  const feed=await readReservaFeed();const known=new Set(products.flatMap((p:any)=>[designKey(p.link),...variants(p.manual_variants).map(v=>designKey(v.link))]));
  const groups=new Map<string,{name:string;link:string;models:string[]}>();for(const e of feed.values()){const key=designKey(e.link)!;if(known.has(key))continue;const group=groups.get(key)||{name:e.title.split(' - ').slice(1).join(' - ')||e.title,link:e.link,models:[]};group.models.push(feedModel(e.title));groups.set(key,group)}
  return NextResponse.json({candidates:[...groups.values()]});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Falha na importação.'},{status:400})}
}
