import { hasAnalyticsConsent } from '@/lib/cookie-consent'

// Cliente do Analytics próprio. Só funciona com consentimento de cookies.
// Identificadores são aleatórios e anônimos (sem dados pessoais).

const VISITOR_KEY = 'obicha_vid'
const SESSION_KEY = 'obicha_session'
const SESSION_TTL_MS = 30 * 60 * 1000 // sessão expira após 30 min sem atividade

type Session = { id: string; ts: number; ref: string | null; src: string | null; med: string | null; cmp: string | null }

export type EventMeta = Record<string, string | undefined>

function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {}
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

// obicha.com.br e www.obicha.com.br são o mesmo site
export function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, '')
}

export function isInternalHost(host: string): boolean {
  const h = normalizeHost(host)
  return h === 'obicha.com.br' || h === normalizeHost(window.location.hostname)
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function supplierFromUrl(href: string): 'uma-penca' | 'reserva-ink' | null {
  let h: string
  try { h = new URL(href, window.location.href).hostname.toLowerCase() } catch { return null }
  if (h === 'umapenca.com' || h.endsWith('.umapenca.com') || h === 'lojaumapenca.obicha.com.br') return 'uma-penca'
  if (h === 'lojareservaink.obicha.com.br' || h.endsWith('.reservaink.com.br')) return 'reserva-ink'
  return null
}

function readUtm(): { src: string | null; med: string | null; cmp: string | null } {
  try {
    const q = new URLSearchParams(window.location.search)
    const clean = (v: string | null) => (v ? v.trim().toLowerCase().slice(0, 80) : null)
    let src = clean(q.get('utm_source'))
    let med = clean(q.get('utm_medium'))
    const cmp = clean(q.get('utm_campaign'))
    // cliques de anúncio sem UTM explícito
    if (!src && q.get('gclid')) { src = 'google'; med = med || 'cpc' }
    if (!src && q.get('fbclid')) { src = 'facebook'; med = med || 'paid_social' }
    return { src, med, cmp }
  } catch {
    return { src: null, med: null, cmp: null }
  }
}

function externalReferrer(): string | null {
  try {
    const r = document.referrer
    if (!r) return null
    const u = new URL(r)
    return isInternalHost(u.hostname) ? null : r
  } catch {
    return null
  }
}

function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

// Sessão: guarda a origem da visita (referrer externo + UTM) do início ao fim.
// Navegação interna nunca substitui a origem. Um novo clique de campanha (UTM diferente)
// inicia uma nova sessão.
function getSession(): Session | null {
  try {
    const now = Date.now()
    const utm = readUtm()
    let s: Session | null = null
    try { s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { s = null }
    const expired = !s || now - s.ts > SESSION_TTL_MS
    const newCampaign = !!s && !!utm.src && utm.src !== s.src
    if (!s || expired || newCampaign) {
      s = { id: uuid(), ts: now, ref: externalReferrer(), src: utm.src, med: utm.med, cmp: utm.cmp }
    } else {
      s.ts = now
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    return s
  } catch {
    return null
  }
}

export function buildContext(): { referrer: string | null; meta: EventMeta } | null {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return null
  const vid = getVisitorId()
  const s = getSession()
  const meta: EventMeta = {}
  if (vid) meta.vid = vid
  if (s) {
    meta.sid = s.id
    if (s.src) meta.utm_source = s.src
    if (s.med) meta.utm_medium = s.med
    if (s.cmp) meta.utm_campaign = s.cmp
  }
  return { referrer: s ? s.ref : externalReferrer(), meta }
}

const recent = new Map<string, number>()

// Envia um evento. Nunca envia sem consentimento, em /admin, nem duplicado (mesmo evento em < 1,5 s).
export function sendEvent(event_type: 'pageview' | 'product_click', data: { path: string; label?: string; meta?: EventMeta }) {
  if (typeof window === 'undefined') return
  if (isAdminPath(window.location.pathname) || isAdminPath(data.path)) return
  const ctx = buildContext()
  if (!ctx) return

  const key = event_type + '|' + data.path + '|' + (data.label || '')
  const now = Date.now()
  const last = recent.get(key)
  if (last && now - last < 1500) return
  recent.set(key, now)

  const meta: EventMeta = { ...(data.meta || {}), ...ctx.meta }
  const body = JSON.stringify({
    event_type,
    path: data.path,
    label: data.label || null,
    referrer: event_type === 'pageview' ? ctx.referrer : null,
    meta,
  })

  // sendBeacon sobrevive à navegação (essencial no celular, onde o link abre outra página/app)
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }))) return
  } catch {}
  fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
}
