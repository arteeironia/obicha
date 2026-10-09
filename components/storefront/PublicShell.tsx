'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useRef,useState} from 'react'
import './storefront.css'
export const socialDefaults:Record<string,string>={instagram_url:'https://www.instagram.com/obicha_camisetas/',tiktok_url:'https://www.tiktok.com/@obicha_camisetas',pinterest_url:'https://br.pinterest.com/Obicha_camisetas/',whatsapp_url:'https://wa.me/5519989254769'}
const universe=[['/#missao','Missão'],['/#causa','Nossa causa'],['/#redes','Redes sociais'],['/blog','Blog'],['/respira','Respira'],['/parcerias','Parcerias'],['/projeto-social','Projeto social'],['/#como-comprar','Como comprar']];
export function socialUrl(config:Record<string,string>,key:string){const value=config[key] || socialDefaults[key];try{return new URL(value).protocol==='https:'?value:socialDefaults[key]}catch{return socialDefaults[key]}}
export default function PublicShell({children,config}:{children:React.ReactNode;config:Record<string,string>}){
 const pathname=usePathname();const [open,setOpen]=useState(false);const menu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{setOpen(false);if(menu.current)menu.current.open=false;},[pathname]);
 useEffect(()=>{function close(e:KeyboardEvent){if(e.key==='Escape'){setOpen(false);if(menu.current)menu.current.open=false;}}document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[]);
 const links=[['/#vitrine','Estampas'],['/#modelos','Qual peça?'],['/quiz','Quiz'],['/#manifesto','Manifesto']];
 function close(){setOpen(false);if(menu.current)menu.current.open=false;}
 return <div className="obicha-theme"><a className="skip" href="#conteudo">Ir para o conteúdo</a><header className="header">
 <Link className="brand" href="/" aria-label="Ô bicha! — início"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" width={150} height={100}/></Link>
 <nav aria-label="Navegação principal">{links.map(([href,label])=><Link key={href} href={href} onClick={close} aria-current={pathname===href?'page':undefined}>{label}</Link>)}<details className="nav-universe" ref={menu}><summary>Universo Ô bicha! <span aria-hidden="true">⌄</span></summary><div className="nav-dropdown">{universe.map(([href,label])=><Link key={href} href={href} onClick={close} aria-current={pathname===href?'page':undefined}>{label}</Link>)}</div></details></nav>
 <a className="contact-link" href={socialUrl(config,'whatsapp_url')} target="_blank" rel="noopener noreferrer">Fala com a gente ↗</a>
 <button className="menu-button" aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen(!open)}>Menu <span aria-hidden="true">☰</span></button>
 </header><nav id="mobile-menu" className="mobile-menu" hidden={!open} aria-label="Navegação no celular">{[...links,...universe].map(([href,label])=><Link key={href} href={href} onClick={close}>{label}</Link>)}</nav>
 <div id="conteudo" className={pathname==='/'?'obicha-home':pathname==='/respira'?'obicha-respira':'obicha-legacy'} tabIndex={-1}>{children}</div>
 <footer><div className="wrap footer-directory"><div className="footer-brand"><Link href="/" aria-label="Ô bicha! — início"><img src="/Logo_-_O_Bicha.png" alt="Ô bicha!" width={140} height={95}/></Link><p>Deboche, amor<br/>e resistência.<br/>Feito no Brasil.</p></div>
 <nav aria-label="A marca no rodapé"><strong>A Ô BICHA!</strong>{universe.slice(0,3).map(([h,l])=><Link key={h} href={h}>{l}</Link>)}<Link href="/projeto-social">Projeto social</Link><Link href="/#manifesto">Manifesto</Link></nav>
 <nav aria-label="Conteúdo e parcerias"><strong>PRA ALÉM DA ESTAMPA</strong>{[['/blog','Blog'],['/respira','Respira'],['/parcerias','Parcerias'],['/quiz','Quiz da estampa']].map(([h,l])=><Link key={h} href={h}>{l}</Link>)}</nav>
 <nav aria-label="Compra e atendimento"><strong>ESCOLHA & CONVERSA</strong><Link href="/#vitrine">Estampas</Link><Link href="/#modelos">Guia de peças</Link><Link href="/#como-comprar">Como comprar</Link><a href={socialUrl(config,'whatsapp_url')} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><a href="mailto:faleconosco@obicha.com.br">faleconosco@obicha.com.br</a></nav></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Ô bicha!</span><Link href="/politica-de-privacidade">Privacidade</Link><Link href="/admin">Painel administrativo</Link></div></footer></div>
}
