'use client'

import { useState } from 'react'

export default function ZoomableProductImage({ src, alt, square = true }: { src: string; alt: string; square?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{ cursor: 'zoom-in', overflow: 'hidden' }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', aspectRatio: square ? 1 : undefined, objectFit: 'cover', display: 'block', borderRadius: square ? 0 : 4, border: square ? 'none' : '1px solid rgba(212,168,67,.15)', transition: 'transform .4s ease' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
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
