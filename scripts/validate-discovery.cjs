const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const originalResolve=Module._resolveFilename;Module._resolveFilename=function(id,...args){return originalResolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,...args)};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const p={id:5000,name:'Freddie Mercury Queen',slug:'freddie-mercury-queen',category:'cropped',image_url:'https://example.com/art.png',collections:[{name:'Pride'}],manual_variants:[{type:'Cropped',link:'https://reserva.ink/shop/product/cropped',price:'99,99'},{type:'Camiseta',link:'https://reserva.ink/shop/product/cotton',price:'114,90'}]};
const rows=[p,{...p,id:5001,name:'Hidden test',slug:'hidden-test',hidden:true},{...p,id:5002,name:'Unavailable test',slug:'unavailable-test',manual_variants:p.manual_variants.map(v=>({...v,available:false}))}];
const originalLoad=Module._load;Module._load=function(id,...args){if(id==='@/lib/db-collections')return {getProductsWithCollections:async()=>rows,getCollections:async()=>[{id:1,name:'Bear',slug:'bear'},{id:2,name:'Pride',slug:'pride'}]};return originalLoad.call(this,id,...args)};
(async()=>{
 for(const route of ['camisetas-lgbt','moda-queer','camiseta-orgulho-gay']){
  const page=require('../app/(public)/'+route+'/page.tsx');const html=renderToStaticMarkup(await page.default());
  assert(html.includes('/produtos/freddie-mercury-queen'));assert(!html.includes('Hidden test'));assert(!html.includes('Unavailable test'));assert(!html.includes('algodão sustentável'));assert(!html.includes('selo PETA'));assert(html.includes('application/ld+json'));assert(html.includes('/colecao/bear'));assert.equal(page.metadata.alternates.canonical,'https://www.obicha.com.br/'+route);
  console.log('PASS '+route+' links to actual visible product pages, has unique canonical and honest copy');
 }
 const {buildCatalog}=require('../lib/storefront/catalog.ts');const Schema=require('../components/storefront/DiscoverySchema.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Schema,{name:'</script><script>test',path:'/colecao/bear',products:buildCatalog(rows)}));
 assert(!html.includes('</script><script>test'));const data=JSON.parse(html.match(/<script[^>]*>([\s\S]*)<\/script>/)[1]);assert.equal(data['@graph'][0].mainEntity.itemListElement.length,1);assert.equal(data['@graph'][0].mainEntity.itemListElement[0].url,'https://www.obicha.com.br/produtos/freddie-mercury-queen');
 console.log('PASS Structured collection data points to visible internal products and safely encodes user text');
})().catch(error=>{console.error(error);process.exitCode=1});
