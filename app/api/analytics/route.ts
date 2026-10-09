import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
import { verifyToken } from '@/lib/auth'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const EVENT_TYPES = ['pageview', 'product_click']
const SUPPLIERS = ['reserva-ink', 'uma-penca']
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python-requests/i
const ID_RE = /^[A-Za-z0-9-]{8,64}$/
const MAX_BODY = 4000

// Campos permitidos em meta (qualquer outro é descartado)
const META_FIELDS: Record<string, number> = {
  supplier: 40, collection: 80, position: 40,
  vid: 64, sid: 64, utm_source: 80, utm_medium: 80, utm_campaign: 80,
}

// Limite simples por IP (melhor esforço; cada instância serverless tem o seu contador)
const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 60_000) {
    hits.set(ip, { n: 1, t: now })
    if (hits.size > 5000) hits.clear()
    return false
  }
  h.n++
  return h.n > 120
}

function isAdminPath(p: string) {
  return p === '/admin' || p.startsWith('/admin/')
}

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return false
  return !!(await verifyToken(token))
}

function cleanMeta(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: Record<string, string> = {}
  for (const [k, max] of Object.entries(META_FIELDS)) {
    const v = (raw as Record<string, unknown>)[k]
    if (typeof v === 'string' && v.trim()) out[k] = v.trim().slice(0, max)
  }
  if (out.supplier && !SUPPLIERS.includes(out.supplier)) delete out.supplier
  if (out.vid && !ID_RE.test(out.vid)) delete out.vid
  if (out.sid && !ID_RE.test(out.sid)) delete out.sid
  return Object.keys(out).length ? out : null
}

export async function POST(request: NextRequest) {
  try {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (rateLimited(ip)) return NextResponse.json({ error: 'muitas requisições' }, { status: 429 })

    // Robôs e o próprio admin logado não entram nas estatísticas
    if (BOT_UA.test(request.headers.get('user-agent') || '')) return NextResponse.json({ ok: true })
    if (await isAdmin(request)) return NextResponse.json({ ok: true })

    const text = await request.text()
    if (text.length > MAX_BODY) return NextResponse.json({ error: 'payload grande demais' }, { status: 413 })
    let body: any
    try { body = JSON.parse(text) } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

    const { event_type, path, label, referrer, meta } = body || {}
    if (!EVENT_TYPES.includes(event_type)) return NextResponse.json({ error: 'event_type inválido' }, { status: 400 })
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 200) return NextResponse.json({ error: 'path inválido' }, { status: 400 })
    if (isAdminPath(path)) return NextResponse.json({ ok: true })

    const cleanLabel = typeof label === 'string' && label.trim() ? label.trim().slice(0, 200) : null
    let cleanReferrer: string | null = null
    if (typeof referrer === 'string' && referrer && referrer.length <= 500) {
      try {
        const u = new URL(referrer)
        if (u.protocol === 'http:' || u.protocol === 'https:') cleanReferrer = u.origin + u.pathname
      } catch {}
    }
    const cleanedMeta = cleanMeta(meta)

    await sql`INSERT INTO analytics_events (event_type, path, label, referrer, meta) VALUES (${event_type}, ${path}, ${cleanLabel}, ${cleanReferrer}, ${cleanedMeta ? JSON.stringify(cleanedMeta) : null}::text::jsonb)`
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('analytics POST error', err)
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Relatórios só para o administrador logado
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = parseInt(searchParams.get('days') || '30')
  const days = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 365) : 30

  // Eventos do admin nunca entram nos relatórios (inclui histórico)
  const NOT_ADMIN = sql`(path IS NULL OR (path <> '/admin' AND path NOT LIKE '/admin/%'))`
  const IS_PV = sql`event_type = 'pageview' AND ${NOT_ADMIN}`
  const IS_CLICK = sql`event_type = 'product_click' AND ${NOT_ADMIN}`

  const [topPages, topProducts, topReferrers, totals, dailyViews, topSuppliers, topCollections, topCampaigns, since] = await Promise.all([
    sql`SELECT path, COUNT(*) as views FROM analytics_events
        WHERE ${IS_PV} AND created_at >= NOW() - (${days} || ' days')::interval AND path IS NOT NULL
        GROUP BY path ORDER BY views DESC LIMIT 15`,
    sql`SELECT label, COUNT(*) as clicks FROM analytics_events
        WHERE ${IS_CLICK} AND created_at >= NOW() - (${days} || ' days')::interval AND label IS NOT NULL
        GROUP BY label ORDER BY clicks DESC LIMIT 15`,
    // Origem por sessão (eventos antigos, sem sessão, contam 1 cada). obicha.com.br e www são o mesmo site.
    sql`SELECT source, COUNT(DISTINCT COALESCE(sid, id::text)) as visits FROM (
          SELECT id, meta->>'sid' as sid,
            CASE
              WHEN meta->>'utm_source' IS NOT NULL THEN (meta->>'utm_source') || COALESCE(' / ' || (meta->>'utm_medium'), '')
              WHEN referrer IS NULL OR referrer = '' THEN 'Direto / sem origem'
              WHEN host = 'obicha.com.br' THEN 'Direto / sem origem'
              WHEN host ~ '(^|\\.)instagram\\.com$' THEN 'instagram.com'
              WHEN host ~ '(^|\\.)facebook\\.com$' OR host = 'fb.com' THEN 'facebook.com'
              WHEN host ~ '^(.+\\.)?google\\.' THEN 'google'
              WHEN host = 't.co' THEN 'x.com'
              ELSE host
            END as source
          FROM (
            SELECT *, lower(regexp_replace(regexp_replace(COALESCE(referrer, ''), '^https?://(www\\.)?', ''), '[/?#:].*$', '')) as host
            FROM analytics_events
            WHERE ${IS_PV} AND created_at >= NOW() - (${days} || ' days')::interval
          ) e
        ) t
        GROUP BY source ORDER BY visits DESC LIMIT 15`,
    sql`SELECT
          COUNT(*) FILTER (WHERE ${IS_PV}) as total_pageviews,
          COUNT(DISTINCT meta->>'vid') FILTER (WHERE ${IS_PV}) as visitors,
          COUNT(DISTINCT meta->>'sid') FILTER (WHERE ${IS_PV}) as sessions,
          COUNT(*) FILTER (WHERE ${IS_CLICK}) as total_clicks,
          COUNT(*) FILTER (WHERE ${IS_CLICK} AND meta->>'supplier' = 'reserva-ink') as exits_reserva,
          COUNT(*) FILTER (WHERE ${IS_CLICK} AND meta->>'supplier' = 'uma-penca') as exits_umapenca,
          COUNT(*) FILTER (WHERE ${IS_PV} AND created_at >= NOW() - INTERVAL '24 hours') as pageviews_hoje,
          COUNT(*) FILTER (WHERE ${IS_CLICK} AND created_at >= NOW() - INTERVAL '24 hours') as clicks_hoje
        FROM analytics_events
        WHERE created_at >= NOW() - (${days} || ' days')::interval`,
    sql`SELECT DATE(created_at) as day, COUNT(*) FILTER (WHERE ${IS_PV}) as views
        FROM analytics_events
        WHERE created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY DATE(created_at) ORDER BY day ASC`,
    sql`SELECT meta->>'supplier' as supplier, COUNT(*) as clicks FROM analytics_events
        WHERE ${IS_CLICK} AND created_at >= NOW() - (${days} || ' days')::interval AND meta->>'supplier' IS NOT NULL
        GROUP BY meta->>'supplier' ORDER BY clicks DESC LIMIT 10`,
    sql`SELECT meta->>'collection' as collection, COUNT(*) as clicks FROM analytics_events
        WHERE ${IS_CLICK} AND created_at >= NOW() - (${days} || ' days')::interval AND meta->>'collection' IS NOT NULL
        GROUP BY meta->>'collection' ORDER BY clicks DESC LIMIT 10`,
    sql`SELECT meta->>'utm_campaign' as campaign, COUNT(DISTINCT meta->>'sid') as visits FROM analytics_events
        WHERE ${IS_PV} AND created_at >= NOW() - (${days} || ' days')::interval AND meta->>'utm_campaign' IS NOT NULL
        GROUP BY meta->>'utm_campaign' ORDER BY visits DESC LIMIT 10`,
    sql`SELECT MIN(created_at) as since FROM analytics_events WHERE meta->>'vid' IS NOT NULL`,
  ])

  return NextResponse.json({
    topPages, topProducts, topReferrers, totals: totals[0], dailyViews, topSuppliers, topCollections, topCampaigns,
    trackingSince: since[0]?.since ?? null,
  })
}
