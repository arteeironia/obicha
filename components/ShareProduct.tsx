'use client'
import {useState} from 'react'
import {shareProduct} from '@/lib/share-product'
export default function ShareProduct({name,slug}:{name:string;slug:string}){
 const [message,setMessage]=useState(''),[fallback,setFallback]=useState(false);
 const url='https://www.obicha.com.br/produtos/'+encodeURIComponent(slug);
 async function share(copy=false){try{const result=await shareProduct(name,url,copy);setMessage(result==='copied'?'Link copiado!':result==='shared'?'Compartilhado.':'');setFallback(false)}catch{setMessage('Selecione e copie este endereço:');setFallback(true)}}
 return <div className="product-share"><button type="button" className="button outline" onClick={()=>share()}>Compartilhar estampa ↗</button><button type="button" className="button outline" onClick={()=>share(true)}>Copiar link</button><p role="status" aria-live="polite">{message}</p>{fallback&&<input aria-label="Link direto desta estampa" readOnly value={url} onFocus={e=>e.currentTarget.select()}/>}</div>
}
