window.mountObichaVitrine = function(data) {
  const controller=new AbortController();
  const mountedDialog=document.getElementById('product-dialog');
  'use strict';
  const L = window.ObichaLogic, products = data.products, sizeGuides = window.OBICHA_SIZES || {};
  const $ = id => document.getElementById(id);
  const escape = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storeName = key => key === 'reserva' ? 'Reserva Ink' : 'Uma Penca';
  let homeContent = data.content;
  function openAnyProduct(id) { const before={...filters};filters={search:'',model:'all',store:'all',collection:'all'};openProduct(id);filters=before; }
  function renderHomeContent(content) {
    if(!content)return;
    homeContent=content;
    const p=products.find(p=>p.id===content.hero.productId); if(!p)return;
    const lines=content.hero.title.split('\n');
    $('hero-title').innerHTML=lines.map((line,i)=>i===lines.length-1?`<em>${escape(line)}</em>`:escape(line)).join('<br>');
    document.querySelector('.hero-copy .intro').textContent=content.hero.description;
    $('hero-image').src=content.hero.image||p.image;
    $('hero-image').alt=`Estampa ${p.name} — imagem de referência`;
    $('hero-product').setAttribute('aria-label',`Escolher modelo de ${p.name}`);
    document.querySelector('.hero-product-caption').innerHTML=`<span>${escape(p.name)} <small>${escape(content.hero.caption)}</small></span><span aria-hidden="true">↗</span>`;
    $('featured-section').hidden=!content.featured.length;
    $('featured-grid').innerHTML=content.featured.map(id=>products.find(p=>p.id===id)).filter(Boolean).map(p=>`<article class="featured-card"><button data-featured="${p.id}"><img src="${escape(p.image)}" alt="Estampa ${escape(p.name)}" width="600" height="600" loading="lazy"><span>${escape(p.name)} <span aria-hidden="true">↗</span></span></button></article>`).join('');
    const banners=content.banners||[];
    $('promotion-banners').hidden=!banners.length;
    $('promotion-banners').innerHTML=banners.map(b=>`<a class="promotion-banner" href="${escape(b.href)}"${b.href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}><picture>${b.mobile?`<source media="(max-width: 650px)" srcset="${escape(b.mobile)}">`:''}<img src="${escape(b.desktop)}" alt="${escape(b.title)}" loading="lazy"></picture><span class="banner-caption"><strong>${escape(b.title)}</strong><span>${escape(b.cta)} ${b.href.startsWith('https:')?'↗':'→'}</span></span></a>`).join('');
    if(content.preview){document.querySelector('.review-bar').textContent='PRÉVIA DO RASCUNHO · NADA FOI PUBLICADO';}
  }
  let filters = {search:'', model:'all', store:'all', collection:'all'}, guideModel = 'cotton', visibleCount = 12;
  let activeProduct, activeType, activeStore, activeStoreFilter, lastFocus;
  const familyOrder = ['cotton','peruvian','stonewashed','dryfit','tank','oversized','sweatshirt','cropped','ecobag','bottoms','mug'];
  function updateGuide(key) {
    guideModel = key;
    const info = L.guideInfo(key);
    $('guide-model').value=key;
    $('model-kicker').textContent = info.kicker;
    $('model-title').textContent = info.title;
    $('model-description').textContent = info.description;
    $('model-material').textContent = info.material;
    $('model-fit').textContent = info.fit;
    const count=L.filterProducts(products,{search:'',collection:'all',model:key,store:'all'}).length;
    $('see-model').textContent = `Ver ${count} ${count===1?'estampa':'estampas'} em ${info.label.toLowerCase()} ↓`;
  }
  function render(reset=true) {
    if(reset)visibleCount=12;
    const matches = L.filterProducts(products, filters);
    $('result-count').textContent = `${matches.length} ${matches.length===1?'estampa':'estampas'}${filters.model!=='all'?' · '+L.MODEL_INFO[filters.model].label:''}${filters.store!=='all'?' · '+storeName(filters.store):''}${matches.length>visibleCount?' · mostrando '+visibleCount:''}`;
    $('clear-filters').hidden = !Object.entries(filters).some(([k,v]) => k==='search' ? !!v : v!=='all');
    $('empty-state').hidden = !!matches.length;
    $('load-more').hidden=matches.length<=visibleCount;
    $('catalog-note').textContent='Catálogo Ô bicha!. A foto é um exemplo: as opções disponíveis aparecem em cada estampa. Preço final e disponibilidade são os da loja parceira.';
    $('product-grid').innerHTML = matches.slice(0,visibleCount).map(p => {
      const vs = L.matchingVariants(p,filters), prices = vs.map(v=>L.price(v.price)).filter(v=>v!==null), minimum = prices.length?Math.min(...prices):null;
      const availableModels=familyOrder.filter(key=>vs.some(v=>L.family(v.type)===key));
      const selectedImage = filters.model === 'all' ? p.image : (vs.find(v=>v.image)?.image || p.image);
      return `<article class="product-card"><button data-product="${p.id}" class="product-image" aria-label="Escolher peça de ${escape(p.name)}"><img src="${escape(selectedImage)}" alt="Imagem de referência da estampa ${escape(p.name)}" loading="lazy" width="600" height="600"><span class="image-action">Ver opções <span aria-hidden="true">↗</span></span></button><div class="product-info"><p class="product-collection">${escape(p.collections[0] || 'Ô bicha!')}</p><h3><button data-product="${p.id}">${escape(p.name)}</button></h3><div class="product-models" aria-label="Opções disponíveis desta estampa">${availableModels.map(k=>`<span>${L.MODEL_INFO[k].label}</span>`).join('')}</div><div class="product-meta"><span>${vs.length} ${vs.length===1?'opção':'opções'}</span></div><div class="product-bottom"><span>${minimum===null?'Preço na loja':(prices.length<vs.length?'Referência ': 'A partir de ')+L.formatPrice(minimum)}</span><button data-product="${p.id}" aria-label="Escolher ${escape(p.name)}">Escolher <span aria-hidden="true">→</span></button></div></div></article>`;
    }).join('');
    const collections = [...new Set(products.flatMap(p=>p.collections))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    $('collection-chips').innerHTML = ['all',...collections].map(c=>`<button data-collection="${escape(c)}" aria-pressed="${filters.collection===c}">${c==='all'?'Todas as coleções':escape(c)}</button>`).join('');
  }
  function clear() {
    filters = {search:'',model:'all',store:'all',collection:'all'};
    $('search').value = ''; $('model-filter').value = 'all';render();
  }
  function selectableVariants() {
    return activeProduct.variants.filter(v=>L.supplier(v.link) && (activeStoreFilter==='all'||L.supplier(v.link)===activeStoreFilter));
  }
  function renderSelection() {
    const available = selectableVariants();
    const types = [...new Set(available.map(v=>v.type))];
    if (!types.includes(activeType)) activeType=types[0];
    const variants=available.filter(v=>v.type===activeType);
    if (!variants.some(v=>L.supplier(v.link)===activeStore)) activeStore=L.supplier(variants[0].link);
    const variant = variants.find(v=>L.supplier(v.link)===activeStore);
    $('variant-options').innerHTML = types.map(t=>`<button data-type="${escape(t)}" aria-pressed="${t===activeType}">${escape(t==='Camiseta'?'Camiseta de algodão':t)}</button>`).join('');
    $('selected-title').textContent = activeType==='Camiseta'?'Camiseta de algodão':activeType;
    $('selected-description').textContent = L.detail(activeType,activeStore);
    $('dialog-image').src = variant.image || activeProduct.image;
    $('dialog-image').alt = `Estampa ${activeProduct.name}${variant.image?' no modelo '+activeType:' — imagem de referência'}`;
    $('dialog-image-note').textContent = variant.image ? `Imagem cadastrada para ${activeType.toLowerCase()}. Cores e medidas na loja.` : `Foto de referência (${activeProduct.referenceType.toLowerCase()}). Confira o modelo escolhido na loja.`;
    $('partner-options').innerHTML = variants.map(v=>`<button data-store="${L.supplier(v.link)}" aria-pressed="${L.supplier(v.link)===activeStore}">${storeName(L.supplier(v.link))} <span aria-hidden="true">${L.supplier(v.link)===activeStore?'✓':''}</span></button>`).join('');
    $('partner-choice-label').hidden=variants.length<2;
    $('partner-options').hidden=variants.length<2;
    $('selected-partner').textContent = storeName(activeStore);
    const charts=activeStore==='reserva'?sizeGuides[activeType]:null;
    $('size-guide').hidden=['ecobag','bottoms','mug'].includes(L.family(activeType));
    $('size-guide').open=false;
    $('size-guide-title').textContent=`Medidas deste modelo · ${storeName(activeStore)}`;
    $('size-guide-content').innerHTML=charts?`<p>Compare com uma peça que já veste bem em você, medida deitada. Confira a tolerância e os avisos de modelagem em cada tabela.</p><p class="size-model-name">${escape(activeType)} · Tabelas da Reserva Ink</p>${activeType==='Camiseta Algodão Peruano'?'<p class="size-warning">A tabela traz um aviso específico para as cores verde musgo e oliva. Leia antes de escolher seu tamanho.</p>':''}${charts.tables.map(t=>`<figure><figcaption>${escape(t.label)}</figcaption><a href="${escape(t.image)}" target="_blank" rel="noopener" aria-label="Ampliar tabela de medidas ${escape(t.label)}"><img src="${escape(t.image)}" alt="Tabela de medidas ${escape(t.label)} para ${escape(activeType)} da Reserva Ink" loading="lazy"></a><a class="size-zoom" href="${escape(t.image)}" target="_blank" rel="noopener">Ampliar tabela ↗</a></figure>`).join('')}<p class="size-source">Referência consultada em 09/10/2026. <a href="${escape(variant.link)}" target="_blank" rel="noopener noreferrer">Confirmar as medidas deste produto na Reserva Ink ↗</a>. Confira a tabela vigente na página da peça antes de comprar.</p>`:`<p>As medidas desta peça são as da ${storeName(activeStore)}. Consulte os cortes e a tabela na página do produto escolhido.</p><a class="text-link" href="${escape(variant.link)}" target="_blank" rel="noopener noreferrer">Ver este modelo na ${storeName(activeStore)} ↗</a>`;
    const price=L.price(variant.price);
    $('selected-price').textContent = price===null?'Consulte o preço na loja':L.formatPrice(price);
    $('destination-message').textContent = `Você vai abrir ${$('selected-title').textContent.toLowerCase()} desta estampa na ${storeName(activeStore)}.`;
    $('buy-link').href = variant.link;
    $('buy-link').textContent = `Ver ${$('selected-title').textContent.toLowerCase()} na ${storeName(activeStore)} ↗`;
  }
  function openProduct(id) {
    activeProduct=products.find(p=>p.id===Number(id)||p.aliases?.includes(Number(id)));
    if(!activeProduct)return;
    const matches=L.matchingVariants(activeProduct,filters);
    if(!matches.length)return;
    activeType=matches[0].type; activeStore=L.supplier(matches[0].link);activeStoreFilter=filters.store;
    lastFocus=document.activeElement;
    $('dialog-title').textContent=activeProduct.name;renderSelection();
    $('product-dialog').setAttribute('data-product-name',activeProduct.name);$('product-dialog').showModal();document.body.classList.add('dialog-open');$('dialog-close').focus();
  }
  function closeDialog() { $('product-dialog').close(); }
  $('product-dialog').addEventListener('close',()=>{document.body.classList.remove('dialog-open');lastFocus?.focus();},{signal:controller.signal});
  $('dialog-close').addEventListener('click',closeDialog,{signal:controller.signal});
  $('product-dialog').addEventListener('click',e=>{if(e.target===$('product-dialog')){const r=$('product-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}},{signal:controller.signal});
  document.addEventListener('click', e => {
    const featured=e.target.closest('[data-featured]');if(featured){openAnyProduct(featured.dataset.featured);return;}
    const product=e.target.closest('[data-product]');if(product){openProduct(product.dataset.product);return;}
    const type=e.target.closest('[data-type]');if(type){activeType=type.dataset.type;renderSelection();$('variant-options').querySelector(`[data-type="${CSS.escape(activeType)}"]`)?.focus();return;}
    const store=e.target.closest('[data-store]');if(store){activeStore=store.dataset.store;renderSelection();return;}
    const collection=e.target.closest('[data-collection]');if(collection){filters.collection=collection.dataset.collection;render();$('collection-chips').querySelector(`[data-collection="${CSS.escape(filters.collection)}"]`)?.focus();return;}

  },{signal:controller.signal});
  $('guide-model').addEventListener('change',e=>updateGuide(e.target.value),{signal:controller.signal});
  $('search').addEventListener('input',e=>{filters.search=e.target.value;render();},{signal:controller.signal});
  $('model-filter').addEventListener('change',e=>{filters.model=e.target.value;render();},{signal:controller.signal});
  $('clear-filters').addEventListener('click',clear,{signal:controller.signal});$('empty-clear').addEventListener('click',clear,{signal:controller.signal});
  $('see-model').addEventListener('click',()=>{filters.model=guideModel;filters.store='all';filters.search='';filters.collection='all';$('model-filter').value=guideModel;$('search').value='';render();$('vitrine').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('model-filter').focus({preventScroll:true});},{signal:controller.signal});
  $('load-more').addEventListener('click',()=>{visibleCount+=12;render(false);},{signal:controller.signal});
  $('hero-product').addEventListener('click',()=>openAnyProduct(homeContent.hero.productId),{signal:controller.signal});
  updateGuide('cotton');render();renderHomeContent(homeContent);
  const query=new URLSearchParams(window.location.search);
  const collection=query.get('collection'); if(collection && products.some(p=>p.collections.includes(collection))){filters.collection=collection;render();$('vitrine').scrollIntoView();}
  if(query.get('product')){openAnyProduct(query.get('product'));const requested=query.get('model');if(activeProduct?.variants.some(v=>v.type===requested)){activeType=requested;renderSelection();}}
  return () => {controller.abort();mountedDialog?.close();document.body.classList.remove('dialog-open');};
};
