const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.tsx']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {planCatalogMigration}=require('../lib/storefront/catalog-migration-plan.ts');
const {buildCatalog,variants}=require('../lib/storefront/catalog.ts');
const {parseReservaFeed,reconcileReserva,productKey}=require('../lib/storefront/reserva-feed.ts');
function migrated(rows){rows=structuredClone(rows);for(const u of planCatalogMigration(rows))for(const id of u.aliases){const p=rows.find(p=>p.id===id);p.catalog_group_id=u.id;if(id===u.id){p.name=u.name;p.price=u.price;p.manual_variants=u.variants;}}return rows}
const rows=migrated(JSON.parse(fs.readFileSync('tests/catalog-before-integration.json')));
const rainbow=rows.find(p=>p.name.toLowerCase().includes('rainbow cat')&&(!p.catalog_group_id||p.catalog_group_id===p.id));assert(rainbow);
const before=buildCatalog(rows).find(p=>p.id===rainbow.id);assert(before.variants.length>1);
rainbow.price='R$ 123,45';rainbow.image_url='https://example.com/cat.png';rainbow.name='Rainbow Cat editado';
assert.equal(buildCatalog(rows).find(p=>p.id===rainbow.id).variants.length,before.variants.length);
console.log('PASS Rainbow Cat preserves every option after admin edits');
const r='https://lojareservaink.obicha.com.br/obichacamisetas/product/cat';const p='https://umapenca.com/obicha/ecobag/cat';
const input={id:1,name:'Cat',link:r,manual_variants:[{type:'Camiseta',price:'10,00',link:r,active:false},{type:'Ecobag',price:'55,00',link:p}]};
const feed=parseReservaFeed('id\ttitle\tlink\tprice\tavailability\n1\t"Cat\tcom detalhe"\t'+r+'\t120.00 BRL\tin stock\n');
const updated=reconcileReserva(input,feed);assert.equal(updated[0].price,'120,00');assert.equal(updated[0].active,false);assert.equal(updated[1].price,'55,00');
assert.equal(buildCatalog([{...input,manual_variants:updated}])[0].variants.length,1);
console.log('PASS Supplier sync preserves editorial pause and Penca price/link');
const deleted=reconcileReserva(input,parseReservaFeed('id\ttitle\tlink\tprice\n2\tOther\thttps://reserva.ink/obichacamisetas/product/other\t10 BRL\n'));
assert.equal(deleted[0].available,false);assert.equal(buildCatalog([{...input,manual_variants:deleted}])[0].variants[0].link,p);
assert.equal(buildCatalog([{...input,manual_variants:[deleted[0]]}]).length,0);
console.log('PASS Deleted Reserva model is hidden while Penca accessory survives');
for(const text of ['', '<html>429</html>', 'id\ttitle\tlink\tprice\n', 'id\ttitle\tlink\tprice\n1\t"broken'])assert.throws(()=>parseReservaFeed(text));
assert.equal(productKey(r),productKey('https://reserva.ink/obichacamisetas/product/cat?utm_source=test'));
console.log('PASS Empty/truncated/error feeds rejected and supplier domains matched');
if(fs.existsSync('/tmp/obicha-reserva-feed.tsv')&&fs.existsSync('/tmp/obicha-live-products.json')){
 const feed=parseReservaFeed(fs.readFileSync('/tmp/obicha-reserva-feed.tsv','utf8'));
 const rows=migrated(JSON.parse(fs.readFileSync('/tmp/obicha-live-products.json')));
 const catalog=buildCatalog(rows);const reserva=catalog.flatMap(p=>p.variants).filter(v=>productKey(v.link));
 const missing=reserva.filter(v=>!feed.has(productKey(v.link)));
 console.log(JSON.stringify({dryRun:true,designs:catalog.length,options:catalog.reduce((s,p)=>s+p.variants.length,0),reservaOptions:reserva.length,feedProducts:feed.size,missing:missing.length,missingNames:catalog.filter(p=>p.variants.some(v=>missing.includes(v))).map(p=>p.name)}));
}

const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),HomeLayout=require('../components/storefront/HomeLayout.tsx').default;
const catalog=buildCatalog(rows),content=JSON.parse(fs.readFileSync('lib/storefront/default-content.json'));
const html=renderToStaticMarkup(React.createElement(HomeLayout,{products:catalog,content}));
assert.equal((html.match(/class="product-card"/g)||[]).length,catalog.length);
assert(html.includes('Rainbow Cat editado'));assert(html.includes('Modelos e lojas'));assert(html.includes('data-collection='));assert(html.includes('https://umapenca.com/'));assert(html.includes('https://lojareservaink.obicha.com.br/'));
console.log('PASS Server HTML includes the complete catalog, collections and working supplier links without JavaScript');
