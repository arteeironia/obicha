import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada')
}

export const sql = neon(process.env.DATABASE_URL)

// ===== PRODUTOS =====
export async function getProducts(category?: string) {
  if (category && category !== 'todos') {
    return sql`SELECT * FROM products WHERE category = ${category} ORDER BY created_at DESC`
  }
  return sql`SELECT * FROM products ORDER BY created_at DESC`
}

export async function createProduct(data: {
  name: string
  category: string
  price: string
  link: string
  image_url?: string
  description?: string
}) {
  const [product] = await sql`
    INSERT INTO products (name, category, price, link, image_url, description)
    VALUES (${data.name}, ${data.category}, ${data.price}, ${data.link}, ${data.image_url || null}, ${data.description || null})
    RETURNING *
  `
  return product
}

export async function updateProduct(id: number, data: Partial<{
  name: string
  category: string
  price: string
  link: string
  image_url: string
  description: string
}>) {
  const [product] = await sql`
    UPDATE products SET
      name = COALESCE(${data.name ?? null}, name),
      category = COALESCE(${data.category ?? null}, category),
      price = COALESCE(${data.price ?? null}, price),
      link = COALESCE(${data.link ?? null}, link),
      image_url = COALESCE(${data.image_url ?? null}, image_url),
      description = COALESCE(${data.description ?? null}, description),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return product
}

export async function deleteProduct(id: number) {
  await sql`DELETE FROM products WHERE id = ${id}`
}

// ===== POSTS SOCIAIS =====
export async function getSocialPosts(platform?: string) {
  if (platform) {
    return sql`SELECT * FROM social_posts WHERE platform = ${platform} ORDER BY created_at DESC`
  }
  return sql`SELECT * FROM social_posts ORDER BY created_at DESC`
}

export async function createSocialPost(data: { platform: string; url: string }) {
  const [post] = await sql`
    INSERT INTO social_posts (platform, url)
    VALUES (${data.platform}, ${data.url})
    RETURNING *
  `
  return post
}

export async function deleteSocialPost(id: number) {
  await sql`DELETE FROM social_posts WHERE id = ${id}`
}

// ===== PINS PINTEREST =====
export async function getPinterestPins() {
  return sql`SELECT * FROM pinterest_pins ORDER BY created_at DESC`
}

export async function createPinterestPin(data: { image_url: string; pin_url?: string }) {
  const [pin] = await sql`
    INSERT INTO pinterest_pins (image_url, pin_url)
    VALUES (${data.image_url}, ${data.pin_url || null})
    RETURNING *
  `
  return pin
}

export async function deletePinterestPin(id: number) {
  await sql`DELETE FROM pinterest_pins WHERE id = ${id}`
}

// ===== BLOG =====
export async function getBlogPosts(onlyPublished = true) {
  if (onlyPublished) {
    return sql`SELECT id, title, slug, excerpt, cover_image, published, created_at FROM blog_posts WHERE published = true ORDER BY created_at DESC`
  }
  return sql`SELECT id, title, slug, excerpt, cover_image, published, created_at FROM blog_posts ORDER BY created_at DESC`
}

export async function getBlogPostBySlug(slug: string) {
  const [post] = await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`
  return post || null
}

export async function createBlogPost(data: {
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image?: string
  published?: boolean
}) {
  const [post] = await sql`
    INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, published)
    VALUES (${data.title}, ${data.slug}, ${data.excerpt || null}, ${data.content}, ${data.cover_image || null}, ${data.published ?? false})
    RETURNING *
  `
  return post
}

export async function updateBlogPost(id: number, data: Partial<{
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  published: boolean
}>) {
  const [post] = await sql`
    UPDATE blog_posts SET
      title = COALESCE(${data.title ?? null}, title),
      slug = COALESCE(${data.slug ?? null}, slug),
      excerpt = COALESCE(${data.excerpt ?? null}, excerpt),
      content = COALESCE(${data.content ?? null}, content),
      cover_image = COALESCE(${data.cover_image ?? null}, cover_image),
      published = COALESCE(${data.published ?? null}, published),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return post
}

export async function deleteBlogPost(id: number) {
  await sql`DELETE FROM blog_posts WHERE id = ${id}`
}

// ===== SITE CONFIG =====
export async function getSiteConfig() {
  const rows = await sql`SELECT key, value FROM site_config`
  return Object.fromEntries(rows.map((r: any) => [r.key, r.value]))
}

export async function updateSiteConfig(key: string, value: string) {
  await sql`
    INSERT INTO site_config (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
  `
}

// ===== ADMIN CONFIG =====
export async function getAdminConfig() {
  const [config] = await sql`SELECT * FROM admin_config LIMIT 1`
  return config
}

export async function updateAdminPassword(hashedPassword: string) {
  await sql`UPDATE admin_config SET password_hash = ${hashedPassword}, updated_at = NOW()`
}
