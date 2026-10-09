import defaults from './default-content.json'
import type { Design } from './catalog'
import { visibleBanners } from './cms'
export type Banner = {id:string;title:string;cta:string;href:string;desktop:string;mobile:string;state:'draft'|'active'|'paused';start:string;end:string}
export type HomeContent = {hero:{productId:number;title:string;description:string;caption:string;image:string};featured:number[];banners:Banner[]}
export function defaultContent(products: Design[]):HomeContent {
 if(!products.length)throw new Error('O catálogo não tem destinos válidos.');
 return {...structuredClone(defaults),hero:{...defaults.hero,productId:products.some(p=>p.id===defaults.hero.productId)?defaults.hero.productId:products[0].id},featured:defaults.featured.filter(id=>products.some(p=>p.id===id)),banners:[]};
}
export function resolveContent(content:HomeContent,products:Design[],preview=false) {
 const ids=new Set(products.map(p=>p.id));
 const hero=ids.has(content.hero.productId)?content.hero:{...content.hero,productId:products[0]?.id};
 return {...content,hero,featured:content.featured.filter(id=>ids.has(id)),banners:visibleBanners(content,Date.now(),preview),preview};
}
