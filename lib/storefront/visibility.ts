import {model,supplier,variants,type SourceProduct} from './catalog'
export const modelFamilies:Record<string,string>={cotton:'Camiseta de algodão',peruvian:'Algodão peruano',stonewashed:'Estonada',dryfit:'Dry fit',tank:'Regata',oversized:'Oversized',sweatshirt:'Moletons (hoodie, suéter e cropped)',cropped:'Cropped',ecobag:'Ecobag',mug:'Caneca',bottoms:'Bottons',other:'Outros'}
export function modelFamily(type:string){
 const t=type.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/moletom|hoodie|sueter/.test(t))return 'sweatshirt';
 if(/peruano/.test(t))return 'peruvian';if(/oversized/.test(t))return 'oversized';if(/estonad/.test(t))return 'stonewashed';if(/dry.?fit/.test(t))return 'dryfit';if(/regata/.test(t))return 'tank';if(/cropped/.test(t))return 'cropped';if(/ecobag/.test(t))return 'ecobag';if(/caneca/.test(t))return 'mug';if(/botton|bottom/.test(t))return 'bottoms';if(/camiseta|algodao/.test(t))return 'cotton';return 'other';
}
export function productOptions(p:SourceProduct){const stored=variants(p.manual_variants);return stored.length?stored:p.link?[{type:model(p.category),link:p.link,price:p.price||'',active:true,available:true,image:null}]:[]}
export function visibilityStatus(p:SourceProduct&{hidden?:boolean}){
 if(p.hidden)return 'hidden';const options=productOptions(p).filter(v=>supplier(v.link));
 if(!options.some(v=>v.active!==false))return 'paused';
 return options.some(v=>v.active!==false&&v.available!==false)?'visible':'unavailable';
}
export const statusLabels:Record<string,string>={visible:'Visível',hidden:'Oculta por você',paused:'Modelos ocultos por você',unavailable:'Indisponível na loja'}
export type VisibilityAction={scope:'designs'|'models';visible:boolean;family?:string;store?:string}
export function applyVisibility(p:SourceProduct&{hidden?:boolean},action:VisibilityAction){
 if(action.scope==='designs')return {hidden:!action.visible};
 const options=productOptions(p).map(v=>({...v,image_url:v.image,active:modelFamily(v.type)===action.family&&(!action.store||action.store==='all'||supplier(v.link)===action.store)?action.visible:v.active!==false}));
 return {manual_variants:options};
}
export function filterCatalogProducts<T extends SourceProduct&{hidden?:boolean}>(products:T[],filter:{search:string;family:string;store:string;collection:string;status:string}){
 const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return products.filter(p=>{
  const options=productOptions(p);const collections=[...(p.collections?.map(c=>c.name)||[]),p.collection_name||''];
  return (!filter.search||norm([p.name,...collections].join(' ')).includes(norm(filter.search)))&&
   (filter.status==='all'||visibilityStatus(p)===filter.status)&&
   (filter.collection==='all'||collections.includes(filter.collection))&&
   ((filter.family==='all'&&filter.store==='all')||options.some(v=>(filter.family==='all'||modelFamily(v.type)===filter.family)&&(filter.store==='all'||supplier(v.link)===filter.store)));
 });
}
