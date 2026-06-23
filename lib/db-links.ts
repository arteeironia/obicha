import postgres from 'postgres'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada')
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

// ===== LINKS =====
export async function getLinks(onlyActive = true) {
  if (onlyActive) {
    return sql`SELECT * FROM links WHERE active = true ORDER BY position ASC`
  }
  return sql`SELECT * FROM links ORDER BY position ASC`
}

export async function createLink(data: { label: string; url: string; position?: number; active?: boolean }) {
  const [link] = await sql`
    INSERT INTO links (label, url, position, active)
    VALUES (${data.label}, ${data.url}, ${data.position ?? 0}, ${data.active ?? true})
    RETURNING *`
  return link
}

export async function updateLink(id: number, data: Partial<{ label: string; url: string; position: number; active: boolean }>) {
  const [link] = await sql`
    UPDATE links SET
      label = COALESCE(${data.label ?? null}, label),
      url = COALESCE(${data.url ?? null}, url),
      position = COALESCE(${data.position ?? null}, position),
      active = COALESCE(${data.active ?? null}, active)
    WHERE id = ${id} RETURNING *`
  return link
}

export async function deleteLink(id: number) {
  await sql`DELETE FROM links WHERE id = ${id}`
}

export async function reorderLinks(updates: { id: number; position: number }[]) {
  for (const u of updates) {
    await sql`UPDATE links SET position = ${u.position} WHERE id = ${u.id}`
  }
}

// ===== CLIQUES =====
export async function registerClick(linkId: number) {
  await sql`INSERT INTO link_clicks (link_id) VALUES (${linkId})`
}

export async function getClickStats() {
  return sql`
    SELECT
      l.id,
      l.label,
      l.url,
      l.active,
      COUNT(lc.id) AS total_cliques,
      COUNT(CASE WHEN lc.clicked_at >= NOW() - INTERVAL '24 hours' THEN 1 END) AS cliques_hoje,
      COUNT(CASE WHEN lc.clicked_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS cliques_semana,
      COUNT(CASE WHEN lc.clicked_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS cliques_mes
    FROM links l
    LEFT JOIN link_clicks lc ON lc.link_id = l.id
    GROUP BY l.id ORDER BY total_cliques DESC`
}
