const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {parseReservaFeed}=require('../lib/storefront/reserva-feed.ts');
const {discoverReservaDesigns}=require('../lib/storefront/reserva-discovery.ts');
const {recentReservaLinks,includeRecentReserva}=require('../lib/storefront/reserva-recent.ts');
const root='https://lojareservaink.obicha.com.br/obichacamisetas/product/';
const a=root+'nova',b=root+'nova-11111111-1111-1111-1111-111111111111';
const feed=parseReservaFeed(`id\ttitle\tlink\tprice\tavailability\n1\tCamiseta - Nova\t${a}\t114.90 BRL\tin stock\n2\tRegata - Nova\t${b}\t99.90 BRL\tin stock\n`);
const found=discoverReservaDesigns([],feed);assert.equal(found.length,1);assert.equal(found[0].manual_variants.length,2);
for(const row of [{id:1,name:'Renomeada',link:a,hidden:true},{id:2,name:'Alias',catalog_group_id:1,manual_variants:[{type:'Regata',link:b,active:false}]}])assert.equal(discoverReservaDesigns([row],feed).length,0);
assert.equal(discoverReservaDesigns([{id:4,name:'Nova',link:'https://umapenca.com/nova'}],feed).length,1);
const listing='<script type="application/ld+json">'+JSON.stringify({'@type':'ItemList',itemListElement:[{url:a},{url:b},{url:'https://evil.com/product/x'}]})+'</script>';
assert.deepEqual(recentReservaLinks(listing),[a,b]);
(async()=>{
 const calls=[];global.fetch=async url=>{calls.push(url);return {ok:true,text:async()=>String(url).includes('/products?')?listing:'<script type="application/ld+json">'+JSON.stringify({'@type':'Product',name:(url===a?'Camiseta':'Regata')+' Nova',category:url===a?'Camiseta':'Regata',image:['https://example.com/image.jpg'],offers:{price:114.90,priceCurrency:'BRL',availability:'https://schema.org/InStock'}})+'</script>'}};
 const empty=new Map();const enriched=await includeRecentReserva([],empty);assert.equal(enriched.size,2);assert.equal(discoverReservaDesigns([],enriched)[0].manual_variants.length,2);assert.ok([...enriched.values()].every(e=>Date.parse(e.pending_until)>Date.now()));
 calls.length=0;await includeRecentReserva([{id:1,name:'Hidden',hidden:true,link:a}],empty);assert.equal(calls.length,1);
 console.log('PASS grouped models, repeat/hidden/alias deduplication, supplier isolation, validated listing, export-lag discovery and grace');
})().catch(e=>{console.error(e);process.exitCode=1});
