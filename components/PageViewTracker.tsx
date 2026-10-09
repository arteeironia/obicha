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

export default function PageViewTracker() {
  const pathname = usePathname()

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
