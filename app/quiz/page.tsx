'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { QUIZ_RESULTS, calculateQuizResult, pickQuizQuestions, type CollectionSlug, type QuizQuestion } from '@/lib/quiz-content'

const C = { cream: '#F2EBD9', navy: '#1A2744', red: '#C0281C', gold: '#D4A843', line: 'rgba(212,168,67,.2)' }
const bebas = { fontFamily: 'var(--font-bebas)' }
const playfair = { fontFamily: 'var(--font-playfair)' }

type Product = { id: number; name: string; image_url: string | null; link: string; price: string }

export default function QuizPage() {
  const [step, setStep] = useState(-1) // -1 = intro, 0..8 = perguntas, 9 = resultado
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<CollectionSlug[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)

  const total = questions.length || 9
  const resultSlug = step === total && questions.length ? calculateQuizResult(answers) : null
  const result = resultSlug ? QUIZ_RESULTS[resultSlug] : null

  function startQuiz() {
    setQuestions(pickQuizQuestions(9))
    setAnswers([])
    setStep(0)
  }

  async function answer(collection: CollectionSlug) {
    const next = [...answers, collection]
    setAnswers(next)
    if (step + 1 === total) {
      const finalResult = calculateQuizResult(next)
      setLoadingProducts(true)
      try {
        const res = await fetch(`/api/quiz-products?slug=${finalResult}`)
        const data = await res.json()
        setProducts(data.slice(0, 4))
      } catch {}
      setLoadingProducts(false)
    }
    setStep((s) => s + 1)
  }

  function restart() {
    setStep(-1)
    setAnswers([])
    setProducts([])
  }

  async function generateShareImage() {
    if (!result || !resultSlug) return
    setGenerating(true)
    const canvas = canvasRef.current!
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#1A2744'
    ctx.fillRect(0, 0, 1080, 1920)
    ctx.fillStyle = '#D4A843'
    ctx.fillRect(0, 0, 1080, 6)
    ctx.fillRect(0, 1914, 1080, 6)

    ctx.textAlign = 'center'
    ctx.font = 'bold 70px serif'
    ctx.fillStyle = '#D4A843'
    ctx.fillText('Ô', 430, 240)
    ctx.fillStyle = '#C0281C'
    ctx.fillText('bicha', 610, 240)
    ctx.fillStyle = '#D4A843'
    ctx.fillText('!', 800, 240)

    ctx.font = '28px monospace'
    ctx.fillStyle = 'rgba(212,168,67,0.6)'
    ctx.fillText('QUAL ESTAMPA COMBINA COM VOCÊ', 540, 300)

    ctx.font = 'italic 34px serif'
    ctx.fillStyle = '#F2EBD9'
    ctx.fillText('meu resultado foi', 540, 560)

    ctx.font = 'bold 130px sans-serif'
    ctx.fillStyle = '#D4A843'
    // quebra o título se for grande
    const titleWords = result.title.toUpperCase()
    ctx.fillText(titleWords, 540, 720)

    ctx.font = 'italic 40px serif'
    ctx.fillStyle = '#F2EBD9'
    const taglineWords = result.tagline.split(' ')
    let lines: string[] = []
    let cur = ''
    taglineWords.forEach((w) => {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > 880) { lines.push(cur); cur = w } else cur = test
    })
    lines.push(cur)
    lines.forEach((line, i) => ctx.fillText(line, 540, 860 + i * 55))

    ctx.font = 'bold 42px monospace'
    ctx.fillStyle = '#C0281C'
    ctx.fillText('FAÇA O TESTE TAMBÉM', 540, 1650)
    ctx.font = '32px monospace'
    ctx.fillStyle = 'rgba(212,168,67,0.6)'
    ctx.fillText('OBICHA.COM.BR/QUIZ', 540, 1710)

    canvas.toBlob((blob) => {
      if (!blob) { setGenerating(false); return }
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      if (isMobile) {
        const dataUrl = canvas.toDataURL('image/png')
        window.open(dataUrl, '_blank')
      } else {
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `obicha-quiz-${resultSlug}.png`
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
      }
      setGenerating(false)
    }, 'image/png')
  }

  return (
    <div style={{ background: C.navy, color: C.cream, minHeight: '100vh' }}>
      <style>{`
        .quiz-container { max-width: 560px; margin: 0 auto; padding: 4rem 1.5rem 6rem; }
        .quiz-option { display:block; width:100%; text-align:left; padding:1rem 1.3rem; background:rgba(255,255,255,.03); border:1px solid ${C.line}; border-radius:4px; color:${C.cream}; font-size:1rem; margin-bottom:.8rem; cursor:pointer; transition:all .25s; }
        .quiz-option:hover { border-color:${C.gold}; background:rgba(212,168,67,.08); transform:translateX(4px); }
        .quiz-progress-bar { height:4px; background:rgba(255,255,255,.1); border-radius:2px; overflow:hidden; margin-bottom:2.5rem; }
        .quiz-progress-fill { height:100%; background:${C.gold}; transition:width .3s; }
      `}</style>

      <div className="quiz-container">
        <Link href="/" style={{ ...bebas, color: C.gold, letterSpacing: 2, textDecoration: 'none', fontSize: '1.3rem', display: 'block', marginBottom: '3rem' }}>
          Ô<span style={{ color: C.red }}>bicha</span>!
        </Link>

        {step === -1 && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ ...bebas, letterSpacing: 4, fontSize: '.85rem', color: C.gold, opacity: .8 }}>★ QUIZ ★</span>
            <h1 style={{ ...playfair, fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 900, lineHeight: 1.15, margin: '1rem 0 1.5rem' }}>
              Qual <em style={{ color: C.gold }}>estampa</em> combina com você?
            </h1>
            <p style={{ opacity: .7, marginBottom: '2.5rem', fontSize: '1.05rem' }}>
              {total} perguntinhas rápidas. Zero certo ou errado. Só a sua vibe, estampada.
            </p>
            <button onClick={startQuiz} style={{ ...bebas, letterSpacing: 2, background: C.red, color: C.cream, border: 'none', padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: 4, cursor: 'pointer' }}>
              COMEÇAR
            </button>
          </div>
        )}

        {step >= 0 && step < total && (
          <div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${(step / total) * 100}%` }} />
            </div>
            <span style={{ ...bebas, letterSpacing: 2, fontSize: '.8rem', color: C.gold, opacity: .7 }}>PERGUNTA {step + 1} DE {total}</span>
            <h2 style={{ ...playfair, fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 700, margin: '.8rem 0 2rem', lineHeight: 1.3 }}>
              {questions[step].text}
            </h2>
            {questions[step].options.map((opt, i) => (
              <button key={i} className="quiz-option" onClick={() => answer(opt.collection)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step === total && result && (
          <div style={{ textAlign: 'center' }}>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <span style={{ ...bebas, letterSpacing: 3, fontSize: '.8rem', color: C.gold, opacity: .8 }}>SEU RESULTADO É</span>
            <h1 style={{ ...bebas, fontSize: 'clamp(3rem,10vw,4.5rem)', color: C.gold, letterSpacing: 2, margin: '.5rem 0' }}>
              {result.title.toUpperCase()}
            </h1>
            <p style={{ ...playfair, fontStyle: 'italic', fontSize: '1.2rem', color: C.cream, opacity: .85, marginBottom: '1.5rem' }}>
              {result.tagline}
            </p>
            <p style={{ fontSize: '.95rem', opacity: .75, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 2.5rem' }}>
              {result.description}
            </p>

            <div style={{ display: 'flex', gap: '.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <button onClick={generateShareImage} disabled={generating}
                style={{ ...bebas, letterSpacing: 1, background: 'transparent', color: C.gold, border: `1px solid ${C.gold}`, padding: '.9rem 1.8rem', borderRadius: 999, cursor: 'pointer', opacity: generating ? .6 : 1 }}>
                {generating ? 'GERANDO...' : '📲 BAIXAR RESULTADO'}
              </button>
              <button onClick={restart}
                style={{ ...bebas, letterSpacing: 1, background: 'transparent', color: C.cream, opacity: .6, border: `1px solid ${C.line}`, padding: '.9rem 1.8rem', borderRadius: 999, cursor: 'pointer' }}>
                REFAZER
              </button>
            </div>

            {loadingProducts ? (
              <p style={{ opacity: .5, fontSize: '.9rem' }}>buscando estampas pra você...</p>
            ) : products.length > 0 ? (
              <div>
                <p style={{ ...bebas, letterSpacing: 2, color: C.gold, fontSize: '.85rem', marginBottom: '1.5rem' }}>ESTAMPAS PRA VOCÊ</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {products.map((p) => (
                    <a key={p.id} href={p.link} target="_blank" style={{ display: 'block', textDecoration: 'none', color: C.cream, background: 'rgba(255,255,255,.03)', border: `1px solid ${C.line}`, borderRadius: 4, overflow: 'hidden' }}>
                      {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', display: 'block' }} />}
                      <div style={{ padding: '.7rem' }}>
                        <p style={{ fontSize: '.8rem', lineHeight: 1.3, marginBottom: '.3rem' }}>{p.name}</p>
                        <p style={{ fontSize: '.75rem', opacity: .6 }}>{p.price}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ opacity: .5, fontSize: '.9rem', marginBottom: '2rem' }}>ainda não temos estampas cadastradas nessa coleção</p>
            )}

            <Link href={`/colecao/${resultSlug}`} style={{ ...bebas, letterSpacing: 1, color: C.red, textDecoration: 'none', fontSize: '.95rem' }}>
              Ver coleção completa →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
