import { requireAdmin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = 'obicha'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito grande. Máximo 10MB.' }, { status: 400 })
    }

    const b = Buffer.from(await file.slice(0,16).arrayBuffer())
    const valid = (file.type==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)||(file.type==='image/png'&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))||(file.type==='image/webp'&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP')
    if (!valid) return NextResponse.json({error:'Use JPG, PNG ou WebP válido.'},{status:422})
    const url = await uploadImage(file, folder)
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Erro no upload:', err)
    return NextResponse.json({ error: 'Erro no upload' }, { status: 500 })
  }
}

