'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { hasAnalyticsConsent, CONSENT_EVENT } from '@/lib/cookie-consent'

function track(pathname: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'pageview',
      path: pathname,
      referrer: document.referrer || null,
    }),
    keepalive: true,
  }).catch(() => {})
}

export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (hasAnalyticsConsent()) track(pathname)

    function onConsentChange(e: Event) {
      const value = (e as CustomEvent).detail
      if (value === 'accepted') track(pathname)
    }
    window.addEventListener(CONSENT_EVENT, onConsentChange)
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
