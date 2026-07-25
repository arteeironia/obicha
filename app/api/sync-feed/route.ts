import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const RESERVA_FEED = 'https://reserva.ink/user/dashboard/export_csv.google_tsv_store_feed_200568'
const UMAPENCA_FEED = 'https://umapenca.com/obicha/5873f3a5-d3f6-4242-a3b6-02328c6d39e8/feed/google.xml'

// Prefixos de tipo a remover do título
const TYPE_PREFIXES = [
  'Camiseta Algodão Peruano', 'Camiseta Oversized', 'Camiseta Infantil',
  'Cropped Moletom', 'Hoodie Moletom', 'Suéter Moletom',
  'Camiseta', 'Regata', 'Cropped', 'Caneca', 'Ecobag', 'Bottom', 'Boné'
]

function cleanTitle(title: string): string {
  for (const prefix of TYPE_PREFIXES) {
    const pattern = new RegExp(`^${prefix}\\s*[-–—]\\s*`, 'i')
    if (pattern.test(title)) {
      return title.replace(pattern, '').trim()
    }
  }
  return title.trim()
}

function extractType(title: string): string {
  for (const prefix of TYPE_PREFIXES) {
    const pattern = new RegExp(`^${prefix}\\s*[-–—]`, 'i')
    if (pattern.test(title)) return prefix
  }
  return 'Produto'
}

function parsePrice(price: string): string {
  return price.replace(' BRL', '').replace('.', ',').trim()
    ? `R$ ${price.replace(' BRL', '').replace('.', ',').trim()}`
    : price
}

async function syncReservaInk() {
  const res = await fetch(RESERVA_FEED)
  const text = await res.text()
  const lines = text.trim().split('\n')
  const headers = lines[0].split('\t')

  const idx = (h: string) => headers.indexOf(h)
  const groups = new Map<string, { name: string; desc: string; image: string; variants: any[] }>()

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const id = (cols[idx('id')] || '').trim()
    const title = (cols[idx('title')] || '').replace(/^"|"$/g, '').trim()
    const desc = (cols[idx('description')] || '').replace(/^"|"$/g, '').replace(/<[^>]+>/g, '').trim()
    const image = (cols[idx('image_link')] || '').trim()
    const link = (cols[idx('link')] || '').trim()
    const price = (cols[idx('price')] || '').trim()
    if (!title || !link) continue
    // Pular linhas onde o título é só número (linhas inválidas)
    if (/^\d+$/.test(title)) continue
    const variantType = extractType(title)
    // Remover "..." no final do título truncado
    const fullTitle = title.endsWith('...') ? title.slice(0, -3).trim() : title
    const cleanName = cleanTitle(fullTitle)

    // Usar item_group_id como chave de agrupamento se disponível
    const groupKey = cleanName.toLowerCase().replace(/[^a-z0-9áàâãéêíóôõúüç]/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 400)

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { name: cleanName, desc, image, variants: [] })
    }
    groups.get(groupKey)!.variants.push({ type: variantType, price: parsePrice(price), link, external_id: id })
  }

  let synced = 0
  for (const [groupKey, data] of groups) {
    const [fp] = await sql`
      INSERT INTO feed_products (source, group_id, name, description, image_url)
      VALUES ('reserva-ink', ${groupKey}, ${data.name}, ${data.desc || null}, ${data.image || null})
      ON CONFLICT (source, group_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
      RETURNING id`

    await sql`DELETE FROM feed_variants WHERE feed_product_id = ${fp.id}`
    for (const v of data.variants) {
      await sql`INSERT INTO feed_variants (feed_product_id, variant_type, price, link, external_id)
        VALUES (${fp.id}, ${v.type}, ${v.price}, ${v.link}, ${v.external_id})`
    }
    synced++
  }
  return synced
}

async function syncUmaPenca() {
  const res = await fetch(UMAPENCA_FEED)
  const text = await res.text()

  // Parse XML simples
  const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []
  const groups = new Map<string, { name: string; desc: string; image: string; variants: any[] }>()

  for (const item of items) {
    const get = (tag: string) => {
      const match = item.match(new RegExp(`<(?:g:)?${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/(?:g:)?${tag}>`))||
                    item.match(new RegExp(`<(?:g:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:g:)?${tag}>`))
      return match?.[1]?.trim() || ''
    }

    const title = get('title')
    const desc = get('description').replace(/<[^>]+>/g, '').trim()
    const image = get('image_link')
    const link = get('link')
    const price = get('price')
    const variantType = extractType(title)
    const cleanName = cleanTitle(title)
    const groupKey = cleanName.toLowerCase().replace(/[^a-z0-9áàâãéêíóôõúüç]/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 400)

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { name: cleanName, desc, image, variants: [] })
    }
    groups.get(groupKey)!.variants.push({
      type: variantType,
      price: price.replace(' BRL', '').trim() ? `R$ ${price.replace(' BRL', '').replace('.', ',')}` : price,
      link
    })
  }

  let synced = 0
  for (const [groupKey, data] of groups) {
    const [fp] = await sql`
      INSERT INTO feed_products (source, group_id, name, description, image_url)
      VALUES ('uma-penca', ${groupKey}, ${data.name}, ${data.desc || null}, ${data.image || null})
      ON CONFLICT (source, group_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
      RETURNING id`

    await sql`DELETE FROM feed_variants WHERE feed_product_id = ${fp.id}`
    for (const v of data.variants) {
      await sql`INSERT INTO feed_variants (feed_product_id, variant_type, price, link)
        VALUES (${fp.id}, ${v.type}, ${v.price}, ${v.link})`
    }
    synced++
  }
  return synced
}

export async function POST() {
  try {
    const [reserva, umapenca] = await Promise.all([
      syncReservaInk(),
      syncUmaPenca(),
    ])
    return NextResponse.json({ ok: true, reserva, umapenca })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
