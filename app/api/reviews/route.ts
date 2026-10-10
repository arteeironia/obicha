import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, sameOrigin } from '@/lib/admin-access'
import { readReviews, writeReviews, mergeImport } from '@/lib/reviews-store'
import { parseReservaReviews, REVIEW_SOURCE } from '@/lib/reserva-reviews'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store' }
export async function GET(request: NextRequest) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Entre no admin para continuar.' }, { status: 401, headers })
  return NextResponse.json((await readReviews()).state, { headers })
}
export async function POST(request: NextRequest) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Entre no admin para continuar.' }, { status: 401, headers })
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403, headers })
  try {
    const data = await request.json()
    const previous = await readReviews()
    if (data.revision !== previous.state.revision) return NextResponse.json({ error: 'Outra edição foi salva. Recarregue antes de continuar.' }, { status: 409, headers })
    let update
    if (data.action === 'import') {
      const response = await fetch(REVIEW_SOURCE, { cache: 'no-store', signal: AbortSignal.timeout(15000), redirect: 'error' })
      if (!response.ok) throw new Error('A Reserva Ink não respondeu. As avaliações salvas foram preservadas.')
      const html = await response.text()
      if (html.length > 2000000) throw new Error('Resposta inesperada. A importação anterior foi preservada.')
      update = mergeImport(previous.state, parseReservaReviews(html))
    } else if (data.action === 'save') {
      const ids = new Set(previous.state.reviews.map(r => r.id))
      if (typeof data.enabled !== 'boolean' || !Array.isArray(data.hiddenIds) || !Array.isArray(data.featuredIds) || [...data.hiddenIds, ...data.featuredIds].some(id => typeof id !== 'string' || !ids.has(id))) return NextResponse.json({ error: 'Seleção inválida.' }, { status: 422, headers })
      update = { enabled: data.enabled, hiddenIds: [...new Set<string>(data.hiddenIds)], featuredIds: [...new Set<string>(data.featuredIds)] }
    } else return NextResponse.json({ error: 'Ação inválida.' }, { status: 422, headers })
    const state = await writeReviews(previous, update)
    return state ? NextResponse.json(state, { headers }) : NextResponse.json({ error: 'Outra edição foi salva. Recarregue antes de continuar.' }, { status: 409, headers })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível salvar. As avaliações anteriores foram preservadas.' }, { status: 502, headers })
  }
}
