'use client'
import {useEffect,useState} from 'react'
import type {Design} from '@/lib/storefront/catalog'
import {adminMarkup} from './admin-markup'
import {loadScript} from './scripts'
import './storefront.css'
export default function AdminVitrine({products}:{products:Design[]}){
 const [error,setError]=useState('');
 useEffect(()=>{let cancelled=false,dispose:(()=>void)|undefined;(async()=>{await loadScript('/obicha-ui/cms.js');await loadScript('/obicha-ui/admin.js');if(!cancelled)dispose=window.mountObichaAdmin({products});})().catch(()=>{if(!cancelled)setError('Não foi possível carregar o editor. Recarregue a página.');});return()=>{cancelled=true;dispose?.();};},[products]);
 return <div className="obicha-theme obicha-admin">{error&&<p role="alert">{error}</p>}<div dangerouslySetInnerHTML={{__html:adminMarkup}}/></div>;
}
