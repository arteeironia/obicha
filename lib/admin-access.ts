import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { verifyToken } from './auth'
export async function isAdmin(request?:NextRequest) {
 const token=request ? request.cookies.get('admin_token')?.value : (await cookies()).get('admin_token')?.value;
 return !!token && (await verifyToken(token))?.role==='admin';
}
export function sameOrigin(request:NextRequest) {
 const origin=request.headers.get('origin');
 return !!origin && origin===request.nextUrl.origin;
}
