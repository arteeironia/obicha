import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function POST(request: NextRequest) {
  try {
    const { event_type, path, label, referrer } = await request.json()
    if (!event_type) return NextResponse.json({ error: 'event_type obrigatório' }, { status: 400 })
    await sql`INSERT INTO analytics_events (event_type, path, label, referrer) VALUES (${event_type}, ${path || null}, ${label || null}, ${referrer || null})`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  const [topPages, topProducts, topReferrers, totals, dailyViews] = await Promise.all([
    sql`SELECT path, COUNT(*) as views FROM analytics_events
        WHERE event_type = 'pageview' AND created_at >= NOW() - (${days} || ' days')::interval AND path IS NOT NULL
        GROUP BY path ORDER BY views DESC LIMIT 15`,
    sql`SELECT label, COUNT(*) as clicks FROM analytics_events
        WHERE event_type = 'product_click' AND created_at >= NOW() - (${days} || ' days')::interval AND label IS NOT NULL
        GROUP BY label ORDER BY clicks DESC LIMIT 15`,
    sql`SELECT
          CASE
            WHEN referrer IS NULL OR referrer = '' THEN 'Direto / sem origem'
            ELSE regexp_replace(regexp_replace(referrer, '^https?://(www\\.)?', ''), '/.*$', '')
          END as source,
          COUNT(*) as visits
        FROM analytics_events
        WHERE event_type = 'pageview' AND created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY source ORDER BY visits DESC LIMIT 15`,
    sql`SELECT
          COUNT(*) FILTER (WHERE event_type = 'pageview') as total_pageviews,
          COUNT(*) FILTER (WHERE event_type = 'product_click') as total_clicks,
          COUNT(*) FILTER (WHERE event_type = 'pageview' AND created_at >= NOW() - INTERVAL '24 hours') as pageviews_hoje,
          COUNT(*) FILTER (WHERE event_type = 'product_click' AND created_at >= NOW() - INTERVAL '24 hours') as clicks_hoje
        FROM analytics_events
        WHERE created_at >= NOW() - (${days} || ' days')::interval`,
    sql`SELECT DATE(created_at) as day, COUNT(*) FILTER (WHERE event_type='pageview') as views
        FROM analytics_events
        WHERE created_at >= NOW() - (${days} || ' days')::interval
        GROUP BY DATE(created_at) ORDER BY day ASC`,
  ])

  return NextResponse.json({ topPages, topProducts, topReferrers, totals: totals[0], dailyViews })
}
