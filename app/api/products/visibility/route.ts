import {NextRequest,NextResponse} from 'next/server'
import postgres from 'postgres'
import {isAdmin,sameOrigin} from '@/lib/admin-access'
import {ensureCatalog} from '@/lib/storefront/migrate-catalog'
import {applyVisibility,modelFamilies} from '@/lib/storefront/visibility'
import {invalidateProductCache} from '@/lib/db'
const sql=postgres(process.env.DATABASE_URL!,{ssl:'require'})
export async function PATCH(request:NextRequest){
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403});
 try{
  const {ids,scope,visible,family,store='all'}=await request.json();
  if(!Array.isArray(ids)||!ids.length||ids.length>500||ids.some(id=>!Number.isSafeInteger(id)||id<1)||!['designs','models'].includes(scope)||typeof visible!=='boolean'||!['all','reserva','penca'].includes(store)||(scope==='models'&&!Object.hasOwn(modelFamilies,family)))return NextResponse.json({error:'Seleção ou ação inválida.'},{status:422});
  await ensureCatalog();
  const count=await sql.begin(async tx=>{
   const rows=await tx`SELECT * FROM products WHERE id IN ${tx(ids)} AND (catalog_group_id IS NULL OR catalog_group_id=id) FOR UPDATE`;
   if(rows.length!==new Set(ids).size)throw new Error('Uma estampa da seleção foi excluída ou alterada. Atualize a lista.');
   for(const p of rows){
    const update=applyVisibility(p as any,{scope,visible,family,store});
    if('hidden' in update)await tx`UPDATE products SET hidden=${update.hidden!},updated_at=NOW() WHERE id=${p.id}`;
    else await tx`UPDATE products SET manual_variants=${tx.json(update.manual_variants!)},updated_at=NOW() WHERE id=${p.id}`;
   }
   return rows.length;
  });
  invalidateProductCache();return NextResponse.json({ok:true,count});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Falha ao alterar a visibilidade.'},{status:409})}
}
