import { escapeHtml, rateLimited } from '@/lib/request-security'
import { sameOrigin } from '@/lib/admin-access'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida.'},{status:403})
  if(rateLimited('contact',request,5,60*60*1000))return NextResponse.json({error:'Muitas mensagens. Tente mais tarde.'},{status:429})
  try {
    const raw = await request.text()
    if(Buffer.byteLength(raw)>16000)return NextResponse.json({error:'Mensagem muito grande.'},{status:413})
    const input = JSON.parse(raw)
    if(!input || typeof input.name!=='string' || typeof input.email!=='string' || typeof input.message!=='string' || (input.organization!=null && typeof input.organization!=='string'))return NextResponse.json({error:'Dados inválidos.'},{status:400})
    const {name,email,organization,message,type}=input
    if(name.length>120 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(name+email) || message.length>10000 || (organization||'').length>200)return NextResponse.json({error:'Dados inválidos.'},{status:400})

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 })
    }

    const toEmail = type === 'parcerias'
      ? 'parcerias@obicha.com.br'
      : 'projetosocial@obicha.com.br'

    const subject = type === 'parcerias'
      ? `Nova proposta de parceria — ${name}`
      : `Novo contato de projeto social — ${name}`

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#C0281C;">${escapeHtml(subject)}</h2>
        <hr style="border-color:#D4A843;"/>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        ${organization ? `<p><strong>Organização:</strong> ${escapeHtml(organization)}</p>` : ''}
        <p><strong>Mensagem:</strong></p>
        <p style="background:#f5f5f5;padding:1rem;border-left:4px solid #D4A843;">${escapeHtml(message)}</p>
        <hr style="border-color:#D4A843;"/>
        <p style="font-size:.8rem;color:#999;">Enviado via obicha.com.br</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ô bicha! <noreply@obicha.com.br>',
        to: toEmail,
        reply_to: email,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Contact error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

