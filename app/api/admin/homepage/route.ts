import {NextRequest,NextResponse} from 'next/server'
import {isAdmin,sameOrigin} from '@/lib/admin-access'
import {getProductsWithCollections} from '@/lib/db-collections'
import {buildCatalog,type SourceProduct} from '@/lib/storefront/catalog'
import {resolveContent,type HomeContent} from '@/lib/storefront/content'
import {validateContent} from '@/lib/storefront/cms'
import {readHome,writeHome} from '@/lib/homepage-store'
export const dynamic='force-dynamic'
function reply(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}})}
async function catalog(){return buildCatalog(await getProductsWithCollections() as SourceProduct[])}
export async function GET(request:NextRequest) {
 if(!await isAdmin(request))return reply({error:'Entre no admin para continuar.'},401);
 try{const products=await catalog();const {state}=await readHome(products);return reply({...state,draft:{...resolveContent(state.draft,products),banners:state.draft.banners}})}catch{return reply({error:'Não foi possível carregar a vitrine.'},500)}
}
export async function PUT(request:NextRequest) {
 if(!await isAdmin(request))return reply({error:'Entre no admin para continuar.'},401);
 if(!sameOrigin(request))return reply({error:'Origem inválida.'},403);
 try{
  const raw=await request.text();if(Buffer.byteLength(raw)>50000)return reply({error:'Conteúdo muito grande.'},413);
  const input=JSON.parse(raw);
  if(!['save','publish'].includes(input.action)||!Number.isInteger(input.revision)||input.revision<0)return reply({error:'Operação inválida.'},400);
  const products=await catalog();
  const errors=validateContent(input.content,products.map(p=>p.id),input.action==='publish');
  if(errors.length)return reply({error:errors.join('\n')},422);
  const previous=await readHome(products);
  if(previous.state.revision!==input.revision)return reply({error:'Outra edição foi salva. Recarregue o rascunho antes de tentar novamente.'},409);
  // Store only the editable fields; don't retain arbitrary extra keys from the request.
  const c=input.content;
  const content:HomeContent={hero:{productId:c.hero.productId,title:c.hero.title,description:c.hero.description,caption:c.hero.caption,image:c.hero.image},featured:c.featured,banners:c.banners.map((b:Record<string,string>)=>({id:b.id,title:b.title,cta:b.cta,href:b.href,desktop:b.desktop,mobile:b.mobile,state:b.state,start:b.start,end:b.end}))};
  const state=await writeHome(previous,content,input.action==='publish');
  return state?reply(state):reply({error:'Outra edição foi salva. Recarregue o rascunho.'},409);
 }catch(error){return reply({error:error instanceof SyntaxError?'JSON inválido.':'Não foi possível salvar. Tente novamente.'},error instanceof SyntaxError?400:500)}
}
