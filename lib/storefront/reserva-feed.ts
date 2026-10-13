import {supplier,variants,model,type SourceProduct} from './catalog'
export function productKey(link:string){
 try{const u=new URL(link);return supplier(link)==='reserva'?u.pathname.replace(/\/$/,''):null}catch{return null}
}
export function parseReservaFeed(text:string){
 // TSV fields may contain escaped quotes, tabs and line breaks.
 const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}
  else if(!quoted&&(c==='\t'||c==='\n')){row.push(field.replace(/\r$/,''));field='';if(c==='\n'){rows.push(row);row=[]}}
  else field+=c
 }
 if(quoted)throw new Error('Arquivo da Reserva incompleto: aspas não fechadas.')
 if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row)}
 const headers=rows.shift()?.map(h=>h.replace(/^\uFEFF/,'').trim())||[];
 if(!['id','title','link','price'].every(h=>headers.includes(h)))throw new Error('Arquivo da Reserva sem as colunas obrigatórias.')
 const entries=rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));
 if(!entries.length)throw new Error('A Reserva retornou um catálogo vazio. Nenhum produto foi alterado.')
 if(entries.some(e=>!e.id||!e.title||!productKey(e.link)))throw new Error('Arquivo da Reserva contém produtos inválidos. Nenhum produto foi alterado.')
 return new Map(entries.map(e=>[productKey(e.link)!,e]));
}
export function reconcileReserva(p:SourceProduct,feed:ReturnType<typeof parseReservaFeed>){
 const stored=variants(p.manual_variants);const options=stored.length?stored:p.link?[{type:model(p.category),link:p.link,price:p.price||'',image:null,active:true,available:true}]:[];
 return options.map(v=>{
  const key=productKey(v.link);if(!key)return {...v,image_url:v.image};
  const live=feed.get(key);
  return {...v,image_url:v.image,available:!!live && !['out of stock','out_of_stock','discontinued'].includes(live.availability?.toLowerCase()),price:live?.price?.replace(/\s*BRL$/,'').replace('.',',')||v.price};
 });
}
