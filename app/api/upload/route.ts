import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'obicha'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito grande. Máximo 10MB.' }, { status: 400 })
    }

    const url = await uploadImage(file, folder)
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Erro no upload:', err)
    return NextResponse.json({ error: err.message || 'Erro no upload' }, { status: 500 })
  }
}
