import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

const RESERVA_FEED = 'https://reserva.ink/user/dashboard/export_csv.google_tsv_store_feed_200568'

const TYPE_PREFIXES = [
  'Camiseta Algodão Peruano', 'Camiseta Oversized', 'Camiseta Infantil',
  'Cropped Moletom', 'Hoodie Moletom', 'Suéter Moletom',
  'Camiseta', 'Regata', 'Cropped', 'Caneca', 'Ecobag', 'Bottom', 'Boné'
]

function extractType(title: string): string {
  for (const prefix of TYPE_PREFIXES) {
    if (new RegExp(`^${prefix}\\s*[-–—]`, 'i').test(title)) return prefix
    if (new RegExp(`^${prefix}$`, 'i').test(title)) return prefix
  }
  return 'Ver na loja'
}

function cleanTitle(title: string): string {
  for (const prefix of TYPE_PREFIXES) {
    const cleaned = title.replace(new RegExp(`^${prefix}\\s*[-–—]\\s*`, 'i'), '').trim()
    if (cleaned && cleaned !== title) return cleaned
  }
  return title.trim()
}

function parsePrice(price: string): string {
  const num = price.replace(' BRL', '').trim()
  return num ? `R$ ${num.replace('.', ',')}` : price
}

// Slug estável: usa item_group_id quando disponível, senão derivado do título limpo
function makeSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 300)
}

async function syncReservaInk() {
  const res = await fetch(RESERVA_FEED, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const text = await res.text()
  const lines = text.trim().split('\n')
  const headers = lines[0].split('\t')
  const idx = (h: string) => headers.indexOf(h)

  // Agrupar por item_group_id (coluna do feed)
  const groups = new Map<string, { name: string; desc: string; image: string; variants: any[] }>()

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const itemGroupId = (cols[idx('item_group_id')] || '').trim()
    const title = (cols[idx('title')] || '').replace(/^"|"$/g, '').trim()
    const desc = (cols[idx('description')] || '').replace(/^"|"$/g, '').replace(/<[^>]+>/g, '').slice(0, 2000).trim()
    const image = (cols[idx('image_link')] || '').trim()
    const link = (cols[idx('link')] || '').trim()
    const price = (cols[idx('price')] || '').trim()
    const extId = (cols[idx('id')] || '').trim()

    if (!title || !link) continue
    if (/^\d+$/.test(title)) continue // pular linhas inválidas

    const variantType = extractType(title)
    const cleanName = cleanTitle(title)

    // Usar item_group_id como chave primária de agrupamento
    const groupKey = itemGroupId && itemGroupId !== extId
      ? makeSlug(itemGroupId)
      : makeSlug(cleanName)

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { name: cleanName, desc, image, variants: [] })
    }
    // Evitar variantes duplicadas do mesmo tipo
    const existing = groups.get(groupKey)!
    if (!existing.variants.find(v => v.type === variantType)) {
      existing.variants.push({ type: variantType, price: parsePrice(price), link, external_id: extId })
    }
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
        VALUES (${fp.id}, ${v.type}, ${v.price}, ${v.link}, ${v.external_id || null})`
    }
    synced++
  }
  return synced
}

export async function POST() {
  try {
    const reserva = await syncReservaInk()
    return NextResponse.json({ ok: true, reserva, umapenca: 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
