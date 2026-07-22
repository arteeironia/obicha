'use client'

import { useState, useRef } from 'react'

interface ShareProps {
  slug: string
  title: string
  excerpt: string
}

export function ShareCopyBtn({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(`https://www.obicha.com.br/blog/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="share-btn copy">
      {copied ? '✓ Copiado!' : 'Copiar link'}
    </button>
  )
}

export function ShareButtons({ slug, title, excerpt }: ShareProps) {
  const [generatingStory, setGeneratingStory] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const url = `https://www.obicha.com.br/blog/${slug}`
  const text = encodeURIComponent(`${title}\n\n${url}`)

  async function generateStory() {
    setGeneratingStory(true)
    const canvas = canvasRef.current!
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')!

    // Fundo navy
    ctx.fillStyle = '#1A2744'
    ctx.fillRect(0, 0, 1080, 1920)

    // Padrão de pontos decorativos
    ctx.fillStyle = 'rgba(212,168,67,0.06)'
    for (let x = 0; x < 1080; x += 60) {
      for (let y = 0; y < 1920; y += 60) {
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Linha dourada topo
    ctx.fillStyle = '#D4A843'
    ctx.fillRect(0, 0, 1080, 6)

    // Linha dourada fundo
    ctx.fillStyle = '#D4A843'
    ctx.fillRect(0, 1914, 1080, 6)

    // Bordas laterais douradas
    ctx.fillStyle = 'rgba(212,168,67,0.15)'
    ctx.fillRect(0, 0, 4, 1920)
    ctx.fillRect(1076, 0, 4, 1920)

    // Logo texto "Ô bicha!"
    ctx.font = 'bold 120px serif'
    ctx.fillStyle = '#D4A843'
    ctx.textAlign = 'center'
    ctx.fillText('Ô', 460, 280)
    ctx.fillStyle = '#C0281C'
    ctx.fillText('bicha', 700, 280)
    ctx.fillStyle = '#D4A843'
    ctx.fillText('!', 870, 280)

    // Subtítulo
    ctx.font = '32px monospace'
    ctx.fillStyle = 'rgba(212,168,67,0.6)'
    ctx.letterSpacing = '8px'
    ctx.fillText('OBICHA.COM.BR/BLOG', 540, 340)

    // Linha separadora
    ctx.strokeStyle = 'rgba(212,168,67,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, 400)
    ctx.lineTo(1000, 400)
    ctx.stroke()

    // Estrelinhas decorativas
    ctx.font = '28px sans-serif'
    ctx.fillStyle = '#D4A843'
    ctx.fillText('★ NOVO POST ★', 540, 470)

    // Título do post (quebra de linha automática)
    ctx.font = 'bold 72px serif'
    ctx.fillStyle = '#F2EBD9'
    ctx.textAlign = 'center'
    const titleWords = title.split(' ')
    let lines: string[] = []
    let currentLine = ''
    for (const word of titleWords) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (ctx.measureText(testLine).width > 920) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    const titleY = 620
    lines.forEach((line, i) => {
      ctx.fillText(line, 540, titleY + i * 90)
    })

    // Linha separadora 2
    const afterTitle = titleY + lines.length * 90 + 60
    ctx.strokeStyle = 'rgba(212,168,67,0.2)'
    ctx.beginPath()
    ctx.moveTo(80, afterTitle)
    ctx.lineTo(1000, afterTitle)
    ctx.stroke()

    // Excerpt (quebra de linha)
    ctx.font = '42px serif'
    ctx.fillStyle = 'rgba(242,235,217,0.7)'
    ctx.textAlign = 'center'
    const excerptWords = excerpt.split(' ')
    let excerptLines: string[] = []
    let excerptLine = ''
    for (const word of excerptWords) {
      const testLine = excerptLine ? `${excerptLine} ${word}` : word
      if (ctx.measureText(testLine).width > 900) {
        excerptLines.push(excerptLine)
        excerptLine = word
        if (excerptLines.length >= 6) break
      } else {
        excerptLine = testLine
      }
    }
    if (excerptLines.length < 6) excerptLines.push(excerptLine)

    const excerptY = afterTitle + 80
    excerptLines.forEach((line, i) => {
      ctx.fillText(line, 540, excerptY + i * 60)
    })

    // CTA fundo
    ctx.fillStyle = '#C0281C'
    ctx.fillRect(200, 1680, 680, 100)
    ctx.font = 'bold 44px monospace'
    ctx.fillStyle = '#F2EBD9'
    ctx.textAlign = 'center'
    ctx.fillText('LER NO BLOG →', 540, 1742)

    // URL
    ctx.font = '32px monospace'
    ctx.fillStyle = 'rgba(212,168,67,0.5)'
    ctx.fillText('obicha.com.br/blog', 540, 1840)

    // Download
    const link = document.createElement('a')
    link.download = `obicha-story-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    setGeneratingStory(false)
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <a href={`https://wa.me/?text=${text}`} target="_blank" className="share-btn whatsapp">WhatsApp</a>
      <a href={`https://www.threads.net/intent/post?text=${text}`} target="_blank" className="share-btn threads">Threads</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" className="share-btn facebook">Facebook</a>
      <ShareCopyBtn slug={slug} />
      <button onClick={generateStory} disabled={generatingStory} className="share-btn story">
        {generatingStory ? 'Gerando...' : '📲 Baixar Story'}
      </button>
    </>
  )
}
