'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { hasAnalyticsConsent, CONSENT_EVENT } from '@/lib/cookie-consent'

const SOURCE_KEY = 'obicha_analytics_entry_referrer'

function track(pathname: string) {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return

  // Keep the original external referrer throughout this tab's visit.
  // Internal navigation must not replace the acquisition source.
  let referrer: string | null = null
  try {
    const stored = sessionStorage.getItem(SOURCE_KEY)
    if (stored !== null) {
      referrer = stored || null
    } else {
      const initial = document.referrer
      const external = initial && new URL(initial).origin !== window.location.origin
      referrer = external ? initial : null
      sessionStorage.setItem(SOURCE_KEY, referrer || '')
    }
  } catch {
    // Storage may be blocked; avoid recording internal navigation as referral.
    try {
      const initial = document.referrer
      referrer = initial && new URL(initial).origin !== window.location.origin ? initial : null
    } catch { referrer = null }
  }

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'pageview', path: pathname, referrer }),
    keepalive: true,
  }).catch(() => {})
}

// Track exits to fulfillment partners across all storefront pages.
// Existing tracked links opt out to avoid double counting.
function trackStoreExit(event: MouseEvent) {
  if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) return
  if (!hasAnalyticsConsent()) return
  const target = event.target
  if (!(target instanceof Element)) return
  const anchor = target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return
  if (anchor.hasAttribute('data-analytics-tracked')) return
  let destination: URL
  try { destination = new URL(anchor.href) } catch { return }
  const hostname = destination.hostname.toLowerCase()
  const supplier = hostname === 'umapenca.com' || hostname.endsWith('.umapenca.com') || hostname === 'lojaumapenca.obicha.com.br'
    ? 'uma-penca'
    : hostname === 'lojareservaink.obicha.com.br' || hostname.endsWith('.reservaink.com.br')
      ? 'reserva-ink'
      : null
  if (!supplier) return

  const label = (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120) || 'Ver na loja'
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'product_click',
      path: window.location.pathname,
      label: window.location.pathname + ' — ' + label,
      meta: { supplier, position: 'store_exit' },
    }),
    keepalive: true,
  }).catch(() => {})
}

export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    document.addEventListener('click', trackStoreExit, true)
    return () => document.removeEventListener('click', trackStoreExit, true)
  }, [])

  useEffect(() => {
    if (hasAnalyticsConsent()) track(pathname)

    function onConsentChange(e: Event) {
      if ((e as CustomEvent).detail === 'accepted') track(pathname)
    }
    window.addEventListener(CONSENT_EVENT, onConsentChange)
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange)
  }, [pathname])

  return null
}
