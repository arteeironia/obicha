import {NextRequest,NextResponse} from 'next/server'
import {isAdmin,sameOrigin} from '@/lib/admin-access'
import {refreshReservaCatalog,reservaSyncStatus} from '@/lib/storefront/sync-reserva'
export async function GET(request:NextRequest){
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401});
 return NextResponse.json(await reservaSyncStatus());
}
export async function POST(request:NextRequest){
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin.'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403});
 try{const result=await refreshReservaCatalog(true);return NextResponse.json({ok:true,...result,reserva:result.updated,umapenca:0});}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Falha ao sincronizar.'},{status:502})}
}
