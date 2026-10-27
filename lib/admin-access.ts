import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
export async function isAdmin(request?:NextRequest) {
 const token=request ? request.cookies.get('admin_token')?.value : (await cookies()).get('admin_token')?.value;
 return !!token && (await verifyToken(token))?.role==='admin';
}
export function sameOrigin(request:NextRequest) {
 const origin=request.headers.get('origin');
 return !!origin && origin===request.nextUrl.origin;
}


export async function requireAdmin(request:NextRequest) {
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin para continuar.'},{status:401});
 if(!['GET','HEAD','OPTIONS'].includes(request.method)&&!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403});
 return null;
}
