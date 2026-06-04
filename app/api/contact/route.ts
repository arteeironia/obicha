import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, organization, message, type } = await request.json()

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
        <h2 style="color:#C0281C;">${subject}</h2>
        <hr style="border-color:#D4A843;"/>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        ${organization ? `<p><strong>Organização:</strong> ${organization}</p>` : ''}
        <p><strong>Mensagem:</strong></p>
        <p style="background:#f5f5f5;padding:1rem;border-left:4px solid #D4A843;">${message}</p>
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
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
