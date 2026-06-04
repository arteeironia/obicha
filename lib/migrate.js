const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

async function migrate() {
  const sql = neon(process.env.DATABASE_URL)

  console.log('🚀 Criando tabelas...')

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      price VARCHAR(50) NOT NULL,
      link TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS social_posts (
      id SERIAL PRIMARY KEY,
      platform VARCHAR(20) NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS pinterest_pins (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      pin_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS admin_config (
      id SERIAL PRIMARY KEY,
      password_hash TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  // Verifica se já existe um admin
  const existing = await sql`SELECT id FROM admin_config LIMIT 1`

  if (existing.length === 0) {
    const hash = await bcrypt.hash('OBicha@2025', 12)
    await sql`INSERT INTO admin_config (password_hash) VALUES (${hash})`
    console.log('✅ Admin criado com senha temporária: OBicha@2025')
    console.log('⚠️  Troque a senha no painel admin após o primeiro login!')
  } else {
    console.log('ℹ️  Admin já existe, senha mantida.')
  }

  console.log('✅ Banco de dados configurado com sucesso!')
}

migrate().catch(console.error)
