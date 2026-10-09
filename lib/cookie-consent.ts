export const CONSENT_KEY = 'obicha_cookie_consent'
export const CONSENT_EVENT = 'obicha-cookie-consent-changed'

export type ConsentValue = 'accepted' | 'rejected' | null

export function getConsent(): ConsentValue {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'accepted' || v === 'rejected' ? v : null
  } catch {
    return null // armazenamento bloqueado: tratar como sem consentimento
  }
}

export function setConsent(value: 'accepted' | 'rejected') {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CONSENT_KEY, value) } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted'
}
