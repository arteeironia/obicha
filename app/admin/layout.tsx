'use client'
import './admin-shell.css'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/produtos', label: 'Produtos', icon: '👕' },
  { href: '/admin/categorias', label: 'Categorias', icon: '🏷️' },
  { href: '/admin/vitrine', label: 'Vitrine & campanhas', icon: '▧' },
  { href: '/admin/destaques', label: 'Destaques', icon: '✦' },
  { href: '/admin/blog', label: 'Blog', icon: '✍️' },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: '★' },
  { href: '/admin/comentarios', label: 'Comentários', icon: '💬' },
  { href: '/admin/links', label: 'Links', icon: '🔗' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/auditoria-cliques', label: 'Auditoria de Cliques', icon: '📊' },
  { href: '/admin/site-config', label: 'Links do Site', icon: '⚙️' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
  { href: '/admin/respira', label: 'Respira — Gerenciar', icon: '🫁' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  useEffect(()=>{setMenuOpen(false)},[pathname])
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenuOpen(false)};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[])
  return <div className={'admin-shell '+(pathname==='/admin/produtos'?'catalog-shell':'')}>
   <button className="admin-menu-toggle" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={()=>setMenuOpen(!menuOpen)}>Menu ☰</button>
   {menuOpen&&<div className="admin-menu-backdrop" onClick={()=>setMenuOpen(false)}/>}
   <aside className={'admin-sidebar '+(menuOpen?'open':'')}><div className="admin-sidebar-header"><Link href="/admin"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" width={110} height={74}/><p>PAINEL DA MARCA</p></Link><button className="admin-menu-close" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}>×</button></div>
   <nav id="admin-navigation" aria-label="Painel administrativo">{navItems.map(item=><Link key={item.href} href={item.href} aria-current={pathname===item.href?'page':undefined} onClick={()=>setMenuOpen(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav><footer><Link href="/" target="_blank" rel="noopener noreferrer">Ver site ↗</Link><button onClick={handleLogout}>Sair do painel</button></footer></aside>
   <main className="admin-shell-content">{children}</main>
  </div>
}
