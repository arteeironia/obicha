export const REVIEW_SOURCE = 'https://lojareservaink.obicha.com.br/obichacamisetas/reviews'
export type ReservaReview = { id: string; author: string; date: string; rating: number; text: string; verified: boolean; products: { name: string; url: string }[] }
export type ReviewSnapshot = { importedAt: string; average: number; total: number; reviews: ReservaReview[] }
export type ReviewState = ReviewSnapshot & { enabled: boolean; hiddenIds: string[]; featuredIds: string[]; revision: number }

function plain(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}
export function parseReservaReviews(html: string): ReviewSnapshot {
  const start = html.indexOf('id="store_reviews_items"')
  const end = html.indexOf('id="store_reviews_pagination"', start)
  if (start < 0 || end < 0) throw new Error('A estrutura das avaliações mudou. A importação anterior foi preservada.')
  const items = html.slice(start, end)
  const blocks = items.split(/<div class="flex flex-col md:flex-row gap-2 md:gap-3">/).slice(1)
  const reviews: ReservaReview[] = blocks.map(block => {
    const id = block.match(/helpful-count-frame-(\d+)/)?.[1]
    const author = block.match(/<p class="text-gray-900 font-semibold leading-normal text-base">([\s\S]*?)<\/p>/)?.[1]
    const date = block.match(/<p class="text-gray-500 leading-5 font-normal text-sm">([\s\S]*?)<\/p>/)?.[1]
    const text = block.match(/<p class="text-base text-gray-500 leading-6 font-normal">([\s\S]*?)<\/p>/)?.[1]
    const beforeAuthor = block.slice(0, block.indexOf('text-gray-900 font-semibold'))
    const rating = (beforeAuthor.match(/<span class="text-yellow-300/g) || []).length
    const products = Array.from(block.matchAll(/<a href="([^"]+)" class="underline" target="_blank">([\s\S]*?)<\/a>/g)).map(m => ({ name: plain(m[2]), url: plain(m[1]) }))
    if (!id || !author || !date || text === undefined || rating < 1 || rating > 5 || products.some(p => !p.url.startsWith('https://lojareservaink.obicha.com.br/obichacamisetas/product/'))) throw new Error('Não foi possível conferir todos os dados. A importação anterior foi preservada.')
    return { id, author: plain(author), date: plain(date), text: plain(text), rating, products, verified: plain(block).includes('Compra verificada') }
  })
  const summary = plain(html.slice(0, start).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''))
  const count = summary.match(/\((\d+[.,]\d+)\)\s+(\d+) avaliações/)
  if (!count || reviews.length === 0 || reviews.length !== Number(count[2]) || new Set(reviews.map(r => r.id)).size !== reviews.length) throw new Error('A lista está incompleta. A importação anterior foi preservada.')
  const average = Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10) / 10
  if (average !== Number(count[1].replace(',', '.'))) throw new Error('As notas não conferem. A importação anterior foi preservada.')
  return { importedAt: new Date().toISOString(), average, total: reviews.length, reviews }
}
export function productReviewMatches(review: ReservaReview, links: string[]) {
  const slugs = links.filter(l => l.includes('lojareservaink.obicha.com.br/')).map(l => { try { return new URL(l).pathname.split('/product/')[1]?.replace(/\/$/, '') } catch { return undefined } }).filter(Boolean)
  return review.products.some(p => slugs.includes(new URL(p.url).pathname.split('/product/')[1]?.replace(/\/$/, '')))
}
