const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const {buildCatalog,supplier}=require('../lib/storefront/catalog.ts');
const source=JSON.parse(fs.readFileSync('tests/catalog-before-integration.json','utf8'));
const products=buildCatalog(source);let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name)}
const sandboxLogic={module:{exports:{}},URL,Intl};vm.runInNewContext(fs.readFileSync('public/obicha-ui/logic.js','utf8'),sandboxLogic);const L=sandboxLogic.module.exports;
const base={search:'',model:'all',store:'all',collection:'all'};
check('All 77 verified designs and 485 purchase options survive the integration',()=>{assert.equal(products.length,77);assert.equal(products.reduce((sum,p)=>sum+p.variants.length,0),485);for(const p of products){assert(p.image.startsWith('https:'));for(const v of p.variants){assert(supplier(v.link));if(v.image)assert(v.image.startsWith('https:'));}}});
check('Admin product names, images and prices take priority',()=>{const edited=structuredClone(source);const p=edited.find(p=>p.id===139);p.name='Meu novo nome';p.image_url='https://res.cloudinary.com/example/new.jpg';p.price='120,00';const actual=buildCatalog(edited).find(p=>p.id===139);assert.equal(actual.name,p.name);assert.equal(actual.image,p.image_url);assert(actual.variants.some(v=>v.price==='120,00'));});
check('Removing a registered model does not restore it from the verified snapshot',()=>{const edited=structuredClone(source);const p=edited.find(p=>p.id===139);p.manual_variants=p.manual_variants.filter(v=>v.type!=='Regata');assert(!buildCatalog(edited).find(p=>p.id===139).variants.some(v=>v.type==='Regata'));});
check('New admin designs appear with the correct partner without editing the partner shop',()=>{const p={id:9999,name:'Nova estampa',category:'dryfit',link:'https://umapenca.com/obicha/dry-fit/novo',price:'69,90',image_url:'https://res.cloudinary.com/example/new.jpg',manual_variants:[]};const actual=buildCatalog([...source,p]).find(p=>p.id===9999);assert.equal(actual.variants[0].type,'Camiseta Dry Fit');assert.equal(supplier(actual.variants[0].link),'penca');});
check('Invalid or deceptive shops are never purchase destinations',()=>{for(const link of ['javascript:alert(1)','http://umapenca.com/x','https://umapenca.com.evil.example/x','https://evil.example/x','https://user:pass@umapenca.com/x'])assert.equal(supplier(link),null);});
check('Changing one duplicated design does not silently merge different records',()=>{const edited=structuredClone(source);edited.find(p=>p.id===99).link='https://umapenca.com/obicha/new-product';assert(buildCatalog(edited).some(p=>p.id===99));assert(buildCatalog(edited).some(p=>p.id===57));});
const elements = new Map();
class Element {
  constructor(id='',dataset={}) {this.id=id;this.dataset=dataset;this.handlers={};this.hidden=false;this.value='';this.attributes={};this.style={};this.classList={add(){},remove(){}};this.textContent='';}
  set innerHTML(value){this.html=value;for(const match of value.matchAll(/id="([^"]+)"/g))get(match[1]);}
  get innerHTML(){return this.html || '';}
  addEventListener(type,fn,options){(this.handlers[type] ||= []).push(fn);options?.signal?.addEventListener('abort',()=>{this.handlers[type]=this.handlers[type].filter(x=>x!==fn)},{once:true});}
  setAttribute(k,v){this.attributes[k]=v;}
  querySelector(){return new Element();}
  focus(){document.activeElement=this;}
  scrollIntoView(){}
  showModal(){this.open=true;}
  close(){this.open=false;this.dispatch('close');}
  getBoundingClientRect(){return {left:0,right:1000,top:0,bottom:1000};}
  closest(selector){
    const match=selector.match(/^\[data-(.+)\]$/);
    if(match && Object.hasOwn(this.dataset,match[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase())))return this;
    return selector==='a'&&this.isAnchor ? this : null;
  }
  dispatch(type,options={}){const event={target:this,preventDefault(){},...options};for(const fn of this.handlers[type]||[])fn(event);}
}
function get(id){if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);}
const document={querySelector:get,querySelectorAll:()=>[],getElementById:get,activeElement:new Element(),body:new Element(),handlers:{},addEventListener(type,fn,options){(this.handlers[type] ||= []).push(fn);options?.signal?.addEventListener('abort',()=>{this.handlers[type]=this.handlers[type].filter(x=>x!==fn)},{once:true});}};
function clickData(key,value){const target=new Element('',{[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:String(value)});for(const fn of document.handlers.click||[])fn({target});}
function selectGuide(key){get('guide-model').value=key;get('guide-model').dispatch('change');}
const sizeWindow={};vm.runInNewContext(fs.readFileSync('public/obicha-ui/sizes.js','utf8'),{window:sizeWindow});const sizeGuides=sizeWindow.OBICHA_SIZES;
const homeContent=JSON.parse(fs.readFileSync('lib/storefront/default-content.json','utf8'));homeContent.hero.productId=157;
const window={ObichaLogic:L,OBICHA_CATALOG:products,OBICHA_SIZES:sizeGuides,OBICHA_CONTENT:homeContent,location:{search:''},matchMedia:()=>({matches:false})};
get('mobile-menu').hidden=true;
vm.runInNewContext(fs.readFileSync('public/obicha-ui/vitrine.js','utf8'),{window,document,CSS:{escape:String},URL,URLSearchParams,Intl,AbortController});
const dispose=window.mountObichaVitrine({products,content:homeContent});
check('Initial UI renders all products and active guide',()=>{assert(get('product-grid').innerHTML.includes('data-product="157"'));assert.equal(get('model-title').textContent,'O clássico do dia a dia.');});
check('Search handler, empty state and reset work',()=>{
  get('search').value='zzzmissing';get('search').dispatch('input');assert.equal(get('empty-state').hidden,false);
  get('empty-clear').dispatch('click');assert.equal(get('empty-state').hidden,true);assert(get('result-count').textContent.startsWith(String(products.length)));
});
check('The unified guide applies a piece filter and describes moletom',()=>{
  selectGuide('oversized');get('see-model').dispatch('click');assert.equal(get('model-filter').value,'oversized');
  selectGuide('sweatshirt');assert.equal(get('model-title').textContent,'O deboche também sente frio.');
  get('clear-filters').dispatch('click');
});
check('Freddie cotton routes to Penca and peruano routes to Reserva Ink',()=>{
  clickData('product',137);assert.equal(get('product-dialog').open,true);assert.equal(L.supplier(get('buy-link').href),'penca');
  clickData('type','Camiseta Algodão Peruano');assert.equal(L.supplier(get('buy-link').href),'reserva');
  assert.equal(get('buy-link').href,products.find(p=>p.id===137).variants.find(v=>v.type==='Camiseta Algodão Peruano').link);
  get('dialog-close').dispatch('click');assert.equal(get('product-dialog').open,false);
});
check('Core model selection opens the exact matching option',()=>{
  get('model-filter').value='sweatshirt';get('model-filter').dispatch('change');clickData('product',102);
  assert.equal(L.family(get('selected-title').textContent),'sweatshirt');assert(get('buy-link').textContent.includes('moletom'));
  get('dialog-close').dispatch('click');get('clear-filters').dispatch('click');
});
check('Hero selection is independent of a previous piece filter',()=>{
  get('model-filter').value='ecobag';get('model-filter').dispatch('change');get('hero-product').dispatch('click');
  clickData('type','Camiseta Algodão Peruano');assert.equal(L.supplier(get('buy-link').href),'reserva');
  get('dialog-close').dispatch('click');get('clear-filters').dispatch('click');
});
check('Every configured variant updates the actual purchase button accurately',()=>{
  for(const p of products){clickData('product',p.id);for(const v of p.variants){clickData('type',v.type);clickData('store',L.supplier(v.link));assert.equal(get('buy-link').href,v.link);assert(get('destination-message').textContent.includes(L.supplier(v.link)==='reserva'?'Reserva Ink':'Penca'));}get('dialog-close').dispatch('click');}
});
check('The oversized photograph does not hide Playboy Sheeva cotton',()=>{
  const p=products.find(p=>p.id===152);assert.equal(p.referenceType,'Camiseta Oversized');
  assert(L.filterProducts(products,{...base,model:'cotton'}).some(item=>item.id===152));
  get('model-filter').value='cotton';get('model-filter').dispatch('change');clickData('product',152);
  assert.equal(get('selected-title').textContent,'Camiseta de algodão');
  assert(get('buy-link').href===p.variants.find(v=>L.family(v.type)==='cotton').link);
  get('dialog-close').dispatch('click');get('clear-filters').dispatch('click');
});
check('One guide covers cotton, stonewashed and dry fit without a store step',()=>{
  for(const key of ['cotton','stonewashed','dryfit']){
    selectGuide(key);get('see-model').dispatch('click');assert.equal(get('model-filter').value,key);
    assert(get('result-count').textContent.startsWith(String(L.filterProducts(products,{...base,model:key}).length)));
    const p=L.filterProducts(products,{...base,model:key})[0];clickData('product',p.id);
    if(key!=='cotton')assert.equal(L.supplier(get('buy-link').href),'penca');assert.equal(L.family(get('selected-title').textContent),key);get('dialog-close').dispatch('click');
  }
  get('clear-filters').dispatch('click');
});
check('The same guide routes ecobags, bottons and mugs to the exact accessory',()=>{
  for(const key of ['ecobag','bottoms','mug']){
    selectGuide(key);get('see-model').dispatch('click');const p=L.filterProducts(products,{...base,model:key})[0];clickData('product',p.id);
    assert.equal(L.family(get('selected-title').textContent),key);assert.equal(L.supplier(get('buy-link').href),'penca');get('dialog-close').dispatch('click');
  }
  get('clear-filters').dispatch('click');
});
check('The cotton guide includes both partners without separating the storefront',()=>{
  selectGuide('cotton');get('see-model').dispatch('click');
  const matches=L.filterProducts(products,{...base,model:'cotton'});
  assert(get('result-count').textContent.startsWith(String(matches.length)));
  assert(matches.some(p=>p.variants.some(v=>L.family(v.type)==='cotton'&&L.supplier(v.link)==='reserva')));
  assert(matches.some(p=>p.variants.some(v=>L.family(v.type)==='cotton'&&L.supplier(v.link)==='penca')));
  get('clear-filters').dispatch('click');
});
check('Measure tables follow the exact model and never leak from Reserva to Penca',()=>{
  clickData('product',137);clickData('type','Camiseta');clickData('store','penca');
  assert(!get('size-guide-content').innerHTML.includes('<img'));
  assert(get('size-guide-content').innerHTML.includes(get('buy-link').href));
  clickData('store','reserva');
  assert(get('size-guide-content').innerHTML.includes(get('buy-link').href));
  for(const table of sizeGuides.Camiseta.tables)assert(get('size-guide-content').innerHTML.includes(table.image));
  get('size-guide').open=true;clickData('type','Camiseta Algodão Peruano');
  assert.equal(get('size-guide').open,false);
  for(const table of sizeGuides['Camiseta Algodão Peruano'].tables)assert(get('size-guide-content').innerHTML.includes(table.image));
  assert(get('size-guide-content').innerHTML.includes(get('buy-link').href));
  assert(get('size-guide-content').innerHTML.includes('verde musgo e oliva'));
  clickData('type','Regata');assert(get('size-guide-content').innerHTML.includes(sizeGuides.Regata.tables[0].image));
  assert(!get('size-guide-content').innerHTML.includes('verde musgo'));
  clickData('type','Camiseta');clickData('store','penca');assert(!get('size-guide-content').innerHTML.includes('<img'));
  get('dialog-close').dispatch('click');
});
check('Every Reserva model has source-backed Reserva size tables',()=>{
  const types=new Set(products.flatMap(p=>p.variants.filter(v=>L.supplier(v.link)==='reserva').map(v=>v.type)));
  for(const type of types){assert(sizeGuides[type]);for(const t of sizeGuides[type].tables){assert(t.sourceImage.includes('/size_table/'));assert(t.image.startsWith('https:'));assert.equal(t.image,t.sourceImage);}}
});
check('Choosing a store is offered only when that specific piece has two partners',()=>{
  clickData('product',137);clickData('type','Camiseta');assert.equal(get('partner-options').hidden,false);
  clickData('type','Camiseta Algodão Peruano');assert.equal(get('partner-options').hidden,true);assert.equal(get('partner-choice-label').hidden,true);
  get('dialog-close').dispatch('click');
});

check('Leaving the page removes all shopping event listeners',()=>{dispose();assert.equal(document.handlers.click.length,0);assert.equal(get('search').handlers.input.length,0);assert.equal(get('product-dialog').open,false)});
// Evaluate the same pure CMS validation used by the API and editor.
const cmsCode=ts.transpileModule(fs.readFileSync('lib/storefront/cms.js','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const cmsModule={exports:{}};vm.runInNewContext(cmsCode,{module:cmsModule,exports:cmsModule.exports,URL,Date,Set,Intl});const C=cmsModule.exports;
const initial=JSON.parse(fs.readFileSync('lib/storefront/default-content.json','utf8'));
const banner={id:'campaign',title:'Campanha',cta:'Ver',href:'/#vitrine',desktop:'https://res.cloudinary.com/example/banner.jpg',mobile:'',state:'active',start:'2026-10-10T12:00:00.000Z',end:'2026-10-11T12:00:00.000Z'};
check('Scheduled campaigns appear at the exact start and disappear at the end',()=>{const config={...initial,banners:[banner]};assert.equal(C.visibleBanners(config,Date.parse(banner.start)-1).length,0);assert.equal(C.visibleBanners(config,Date.parse(banner.start)).length,1);assert.equal(C.visibleBanners(config,Date.parse(banner.end)).length,0);});
check('Draft and paused campaigns are absent from the published storefront',()=>{assert.equal(C.visibleBanners({...initial,banners:[{...banner,state:'draft'},{...banner,state:'paused'}]}).length,0)});
check('A draft preview includes complete scheduled campaigns',()=>{assert.equal(C.visibleBanners({...initial,banners:[banner]},Date.parse(banner.start)-1,true).length,1)});
check('Publishing rejects incomplete, unsafe and oversized campaign configurations',()=>{for(const patch of [{title:''},{title:42},{href:'javascript:alert(1)'},{desktop:'https://evil.example/x.png'},{end:banner.start}])assert(C.validateContent({...initial,banners:[{...banner,...patch}]},products.map(p=>p.id),true).length,JSON.stringify(patch));assert(C.validateContent({...initial,featured:Array(13).fill(139)},products.map(p=>p.id),true).length)});
check('Times use São Paulo regardless of the editor computer timezone',()=>{assert.equal(C.fromSaoPaulo('2026-10-10T09:30'),'2026-10-10T12:30:00.000Z');assert.equal(C.toSaoPaulo('2026-10-10T12:30:00.000Z'),'2026-10-10T09:30')});
console.log(`${checks} checks passed; every one of the 485 purchase buttons exercised.`);
