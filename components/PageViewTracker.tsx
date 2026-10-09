'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { hasAnalyticsConsent, CONSENT_EVENT } from '@/lib/cookie-consent'
import { sendEvent, isAdminPath, supplierFromUrl } from '@/lib/analytics-client'

function track(pathname: string) {
  sendEvent('pageview', { path: pathname })
}

// Registra saídas para os fornecedores (Reserva Ink / Uma Penca) em todas as páginas da loja.
// Links que já se registram sozinhos (data-analytics-tracked) são ignorados para não duplicar.
function trackStoreExit(event: MouseEvent) {
  if (isAdminPath(window.location.pathname)) return
  if (!hasAnalyticsConsent()) return
  const target = event.target
  if (!(target instanceof Element)) return
  const anchor = target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return
  if (anchor.hasAttribute('data-analytics-tracked')) return
  const supplier = supplierFromUrl(anchor.href)
  if (!supplier) return

  // Produto clicado: card mais próximo (data-product-name); senão o texto do link
  const product = anchor.closest('[data-product-name]')?.getAttribute('data-product-name')?.trim()
  const text = (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120) || 'Ver na loja'
  const label = product ? `${product} — ${text}` : `${window.location.pathname} — ${text}`
  sendEvent('product_click', {
    path: window.location.pathname,
    label: label.slice(0, 200),
    meta: { supplier, position: 'store_exit' },
  })
}

export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    document.addEventListener('click', trackStoreExit, true)
    return () => document.removeEventListener('click', trackStoreExit, true)
  }, [])

  useEffect(() => {
    if (isAdminPath(pathname)) return
    if (hasAnalyticsConsent()) track(pathname)

    function onConsentChange(e: Event) {
      if ((e as CustomEvent).detail === 'accepted') track(pathname)
    }
    window.addEventListener(CONSENT_EVENT, onConsentChange)
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange)
  }, [pathname])

  return null
}
