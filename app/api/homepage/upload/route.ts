import {NextRequest,NextResponse} from 'next/server'
import {isAdmin,sameOrigin} from '@/lib/admin-access'
import {uploadImage} from '@/lib/cloudinary'
export async function POST(request:NextRequest) {
 if(!await isAdmin(request))return NextResponse.json({error:'Entre no admin para continuar.'},{status:401});
 if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403});
 if(Number(request.headers.get('content-length'))>9*1024*1024)return NextResponse.json({error:'Use uma imagem de até 8 MB.'},{status:413});
 try{
  const data=await request.formData(),file=data.get('file');
  if(!(file instanceof File)||!file.size||file.size>8*1024*1024)return NextResponse.json({error:'Use uma imagem de até 8 MB.'},{status:422});
  const b=Buffer.from(await file.slice(0,16).arrayBuffer());
  const valid=(file.type==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)||(file.type==='image/png'&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))||(file.type==='image/webp'&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP');
  if(!valid)return NextResponse.json({error:'Use uma imagem JPG, PNG ou WebP válida.'},{status:422});
  return NextResponse.json({url:await uploadImage(file,'obicha/campanhas')},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Não foi possível enviar a imagem. Tente novamente.'},{status:500})}
}
