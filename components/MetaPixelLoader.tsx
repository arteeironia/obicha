'use client'

import { useEffect } from 'react'
import { getConsent, CONSENT_EVENT } from '@/lib/cookie-consent'

const PIXEL_ID = '1768645034492668'

function loadPixel() {
  if ((window as any).__obichaPixelLoaded) return
  ;(window as any).__obichaPixelLoaded = true

  const f: any = window
  const b = document
  const e = 'script'
  const v = 'https://connect.facebook.net/en_US/fbevents.js'
  if (f.fbq) return
  const n: any = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  })
  if (!f._fbq) f._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  const t = b.createElement(e) as HTMLScriptElement
  t.async = true
  t.src = v
  const s = b.getElementsByTagName(e)[0]
  s.parentNode?.insertBefore(t, s)

  f.fbq('init', PIXEL_ID)
  f.fbq('track', 'PageView')

  const img = document.createElement('img')
  img.height = 1
  img.width = 1
  img.style.display = 'none'
  img.src = `https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`
  document.body.appendChild(img)
}

export default function MetaPixelLoader() {
  useEffect(() => {
    if (getConsent() === 'accepted') loadPixel()

    function onConsentChange(e: Event) {
      const value = (e as CustomEvent).detail
      if (value === 'accepted') loadPixel()
    }
    window.addEventListener(CONSENT_EVENT, onConsentChange)
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange)
  }, [])

  return null
}
