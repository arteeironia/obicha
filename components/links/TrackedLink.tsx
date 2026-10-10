'use client'

import type { ReactNode } from 'react'

export default function TrackedLink({ id, href, className, children }: {
  id: number; href: string; className: string; children: ReactNode
}) {
  function trackClick() {
    // Navigation remains native and never waits for analytics.
    const body = JSON.stringify({ action: 'click', link_id: id })
    try {
      if (navigator.sendBeacon?.('/api/links', new Blob([body], { type: 'application/json' }))) return
      void fetch('/api/links', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body, keepalive: true,
      }).catch(() => {})
    } catch {
      // Tracking failures must not prevent the link from opening.
    }
  }
  return <a href={href} className={className} onClick={trackClick}>{children}</a>
}
