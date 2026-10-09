'use client'
import {useEffect,useRef,useState} from 'react'
import type {Design} from '@/lib/storefront/catalog'
import type {HomeContent} from '@/lib/storefront/content'
import {homeMarkup} from './home-markup'
import {loadScript} from './scripts'
import {socialDefaults,socialUrl} from './PublicShell'
function safeLink(value:string|null){try{return value&&new URL(value).protocol==='https:'?value:undefined}catch{return undefined}}
export default function Vitrine({products,content,posts,highlights,social,pins,config}:{products:Design[];content:HomeContent&{preview?:boolean};posts:any[];highlights:any[];social:any[];pins:any[];config:Record<string,string>}){
 const root=useRef<HTMLDivElement>(null);const [error,setError]=useState('');
 useEffect(()=>{let cancelled=false,dispose:(()=>void)|undefined;
 (async()=>{await loadScript('/obicha-ui/logic.js');await loadScript('/obicha-ui/sizes.js');await loadScript('/obicha-ui/vitrine.js');if(cancelled)return;
 for(const a of root.current?.querySelectorAll<HTMLAnchorElement>('a[href]')||[]){for(const [key,url] of Object.entries(socialDefaults))if(a.href===url)a.href=socialUrl(config,key)}
 const latest=posts[0];if(latest&&root.current){const block=root.current.querySelector('.blog-feature');if(block){block.querySelector('h3')!.textContent=latest.title;block.querySelector('.article-date')!.textContent=new Date(latest.created_at).toLocaleDateString('pt-BR');const a=block.querySelector<HTMLAnchorElement>('a.button')!;a.href='/blog/'+encodeURIComponent(latest.slug);a.removeAttribute('target');}}
 dispose=window.mountObichaVitrine({products,content});})().catch(()=>{if(!cancelled)setError('A vitrine não carregou. Recarregue a página para escolher seu modelo.');});
 return()=>{cancelled=true;dispose?.();};},[products,content,posts,config]);
 return <>{content.preview&&<div className="review-bar">PRÉVIA DO RASCUNHO · NADA FOI PUBLICADO</div>}{error&&<p role="alert" className="wrap">{error}</p>}<div ref={root} dangerouslySetInnerHTML={{__html:homeMarkup}}/>
 <noscript><div className="wrap content-page"><h2>Escolha sua estampa</h2><p>Ative o JavaScript para comparar modelos e consultar medidas. Links diretos das opções:</p>{products.map(p=><details key={p.id}><summary>{p.name}</summary>{p.variants.map(v=><p key={v.link}><a href={v.link} rel="noopener noreferrer">{v.type} — {new URL(v.link).hostname.includes('reserva')?'Reserva Ink':'Uma Penca'}</a></p>)}</details>)}</div></noscript>
 {highlights.length>0&&<section className="wrap content-page legacy-highlights"><h2>Mais destaques da Ô bicha!</h2><div className="featured-grid">{highlights.filter(h=>!h.expires_at||Date.parse(h.expires_at)>Date.now()).map(h=><article key={h.id}><a href={safeLink(h.link)||'/#vitrine'}><img src={h.images?.[0]?.image_url||'/Logo_-_O_Bicha.png'} alt={h.title} loading="lazy"/><h3>{h.title}</h3>{h.promo_price&&<p>{h.original_price&&<del>{h.original_price} </del>}{h.promo_price}</p>}</a></article>)}</div></section>}
 {(social.length>0||pins.length>0)&&<section className="wrap content-page"><h2>Nas nossas redes</h2><div className="social-links">{social.map(s=><a key={'s'+s.id} href={safeLink(s.url)} target="_blank" rel="noopener noreferrer">{s.platform} ↗</a>)}{pins.map(p=><a key={'p'+p.id} href={safeLink(p.pin_url)} target="_blank" rel="noopener noreferrer">{p.image_url&&<img src={p.image_url} width={180} alt="Ô bicha! no Pinterest" loading="lazy"/>}Pinterest ↗</a>)}</div></section>}</>
}
