import { NextRequest, NextResponse } from 'next/server'
import { getSiteConfig, updateSiteConfig } from '@/lib/db'
import { isAdmin, sameOrigin } from '@/lib/admin-access'
export async function GET() {return NextResponse.json(await getSiteConfig())}
export async function PATCH(request:NextRequest) {
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin para continuar.'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403});
 try {
 const updates=await request.json();
 if(!updates||typeof updates!=='object'||Array.isArray(updates)||Object.keys(updates).some(k=>k==='homepage_content'||k.length>100||typeof updates[k]!=='string'||updates[k].length>4000))return NextResponse.json({error:'Configurações inválidas.'},{status:422});
 for(const [key,value] of Object.entries(updates))await updateSiteConfig(key,value as string);
 return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Não foi possível salvar.'},{status:500})}
}
