import type {Design} from '@/lib/storefront/catalog'
export default function DiscoverySchema({name,path,products}:{name:string;path:string;products:Design[]}){
 const origin='https://www.obicha.com.br';
 const graph={'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','name':name,'url':origin+path,'mainEntity':{'@type':'ItemList','itemListElement':products.filter(p=>p.slug).map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:origin+'/produtos/'+encodeURIComponent(p.slug!)}))}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Ô bicha!',item:origin},{'@type':'ListItem',position:2,name,item:origin+path}]}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>;
}
