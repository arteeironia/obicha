'use client'

import { useState, useEffect } from 'react'

type Category = { id: number; value: string; label: string; active: boolean; position: number }

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/categories?all=true')
    setCategories(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggle(cat: Category) {
    await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id, active: !cat.active }),
    })
    await load()
  }

  const camisetaCategories = categories.filter(c =>
    ['camisetas','estonada','dryfit','modal','peruano','oversized','regata','cropped','cropped-moletom','infantil','hoodie','sueter'].includes(c.value)
  )
  const otherCategories = categories.filter(c =>
    ['bones','canecas','ecobags','bottoms'].includes(c.value)
  )

  const CategoryRow = ({ cat }: { cat: Category }) => (
    <div className="flex items-center justify-between p-4 border rounded mb-2"
      style={{ borderColor: 'rgba(212,168,67,.2)', background: cat.active ? 'rgba(212,168,67,.04)' : 'rgba(255,255,255,.01)', opacity: cat.active ? 1 : .5 }}>
      <div>
        <p className="font-bold text-sm">{cat.label}</p>
        <p className="text-xs opacity-40 mt-0.5">{cat.value}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bebas" style={{ color: cat.active ? '#4ade80' : 'rgba(242,235,217,.3)' }}>
          {cat.active ? '● Ativa' : '○ Inativa'}
        </span>
        <button onClick={() => toggle(cat)} className="text-xs px-3 py-1.5 font-bebas tracking-widest"
          style={{ background: cat.active ? 'rgba(192,40,28,.15)' : 'rgba(212,168,67,.15)', color: cat.active ? 'var(--red)' : 'var(--gold)' }}>
          {cat.active ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-playfair text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>Categorias</h1>
      <p className="opacity-50 text-sm mb-8">Ative ou desative categorias que aparecem nos filtros do site</p>

      {loading ? <p className="opacity-50">Carregando...</p> : (
        <>
          <div className="mb-8">
            <h2 className="font-bebas tracking-widest text-lg mb-4" style={{ color: 'var(--gold)', opacity:.7 }}>👕 Camisetas e Vestuário</h2>
            {camisetaCategories.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
          </div>
          <div>
            <h2 className="font-bebas tracking-widest text-lg mb-4" style={{ color: 'var(--gold)', opacity:.7 }}>🧢 Outros Produtos</h2>
            {otherCategories.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
          </div>
        </>
      )}
    </div>
  )
}
