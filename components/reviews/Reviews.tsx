import Link from 'next/link'
import { readReviews } from '@/lib/reviews-store'
import { REVIEW_SOURCE, productReviewMatches } from '@/lib/reserva-reviews'
import type { ReservaReview } from '@/lib/reserva-reviews'
import styles from './reviews.module.css'

export function ReviewCard({ review }: { review: ReservaReview }) {
  return <article className={styles.card}>
    <p className={styles.stars} aria-label={`${review.rating} de 5 estrelas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
    <p className={styles.author}>{review.author}</p><p className={styles.meta}>{review.date}</p>
    {review.verified && <p className={styles.meta}>Compra verificada na Reserva Ink</p>}
    {review.text ? <blockquote className={styles.quote}>{review.text}</blockquote> : <p className={styles.noText}>Avaliação enviada sem comentário escrito.</p>}
    <p className={styles.meta}>Produtos citados:</p><ul className={styles.products}>{review.products.map(p => <li key={p.url}><a href={p.url} target="_blank" rel="noopener noreferrer">{p.name} ↗</a></li>)}</ul>
    <a className={styles.source} href={REVIEW_SOURCE} target="_blank" rel="noopener noreferrer">Avaliação publicada na Reserva Ink ↗</a>
  </article>
}
export default async function Reviews({ all = false, productLinks }: { all?: boolean; productLinks?: string[] }) {
  const { state } = await readReviews()
  if (!state.enabled) return null
  const visible = state.reviews.filter(r => !state.hiddenIds.includes(r.id))
  const reviews = productLinks ? visible.filter(r => productReviewMatches(r, productLinks)) : all ? visible : visible.filter(r => state.featuredIds.includes(r.id)).slice(0, 3)
  if (!reviews.length) return null
  return <section id="avaliacoes" className={styles.section} aria-labelledby="customer-reviews-title"><div className={styles.wrap}>
    <p className={styles.eyebrow}>QUEM COMPROU, CONTA</p><h2 id="customer-reviews-title" className={styles.heading}>{productLinks ? 'Essa estampa já foi para casa.' : 'Orgulho de quem veste.'}</h2>
    {!productLinks && <p className={styles.summary}><strong>{state.average.toFixed(1).replace('.', ',')}/5</strong> · {state.total} avaliações da nossa loja na Reserva Ink.</p>}
    <p className={styles.description}>{productLinks ? 'Avaliações de pedidos que incluem esta estampa, comprada na Reserva Ink.' : 'Experiências de compras na Reserva Ink, que produz e entrega essas peças.'}</p>
    <div className={styles.grid}>{reviews.map(r => <ReviewCard key={r.id} review={r}/>)}</div>
    <p className={styles.updated}>Importadas em {new Date(state.importedAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. A nota considera todas as avaliações da origem, inclusive as que não estão em destaque.</p>
    {!all && <Link className={styles.source} href="/avaliacoes">Ver todas as avaliações →</Link>}
  </div></section>
}
