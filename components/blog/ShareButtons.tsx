'use client'

export function ShareCopyBtn({ slug }: { slug: string }) {
  return (
    <button
      className="share-btn copy"
      onClick={() => {
        navigator.clipboard.writeText(`https://obicha.com.br/blog/${slug}`)
        alert('Link copiado!')
      }}
    >
      Copiar link
    </button>
  )
}
