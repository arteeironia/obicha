import postgres from 'postgres'
import seed from './reserva-reviews-seed.json'
import type { ReviewState, ReviewSnapshot } from './reserva-reviews'
export const REVIEWS_KEY = 'reserva_reviews'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
export async function readReviews(): Promise<{ state: ReviewState; raw: string | null }> {
  const [row] = await sql`SELECT value FROM site_config WHERE key=${REVIEWS_KEY}`
  if (row) return { state: JSON.parse(row.value), raw: row.value }
  return { state: { ...seed, enabled: true, hiddenIds: [], featuredIds: seed.reviews.filter(r => r.text).map(r => r.id), revision: 0 }, raw: null }
}
export async function writeReviews(previous: { state: ReviewState; raw: string | null }, update: Partial<ReviewState>) {
  const state = { ...previous.state, ...update, revision: previous.state.revision + 1 }
  const value = JSON.stringify(state)
  const rows = previous.raw === null
    ? await sql`INSERT INTO site_config(key,value) VALUES (${REVIEWS_KEY},${value}) ON CONFLICT(key) DO NOTHING RETURNING key`
    : await sql`UPDATE site_config SET value=${value},updated_at=NOW() WHERE key=${REVIEWS_KEY} AND value=${previous.raw} RETURNING key`
  return rows.length ? state : null
}
export function mergeImport(state: ReviewState, snapshot: ReviewSnapshot): Partial<ReviewState> {
  const ids = new Set(snapshot.reviews.map(r => r.id))
  return { ...snapshot, hiddenIds: state.hiddenIds.filter(id => ids.has(id)), featuredIds: state.featuredIds.filter(id => ids.has(id)) }
}
