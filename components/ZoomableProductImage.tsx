'use client'

import { useState, useEffect } from 'react'

let styleInjected = false
function injectHoverStyleOnce() {
  if (styleInjected) return
  const style = document.createElement('style')
  style.textContent = `
    .zoomable-img-wrap { overflow: hidden; cursor: zoom-in; }
    .zoomable-img-wrap img { transition: transform .4s ease; display: block; }
    .zoomable-img-wrap:hover img { transform: scale(1.06); }
  `
  document.head.appendChild(style)
  styleInjected = true
}

export default function ZoomableProductImage({ src, alt, square = true }: { src: string; alt: string; square?: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    injectHoverStyleOnce()
  }, [])

  return (
    <>
      <div className="zoomable-img-wrap" onClick={() => setOpen(true)}>
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            aspectRatio: square ? 1 : undefined,
            objectFit: 'cover',
            borderRadius: square ? 0 : 4,
            border: square ? 'none' : '1px solid rgba(212,168,67,.15)',
          }}
        />
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '2rem', color: 'rgba(255,255,255,.6)', fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 4, cursor: 'default' }}
          />
        </div>
      )}
    </>
  )
}
