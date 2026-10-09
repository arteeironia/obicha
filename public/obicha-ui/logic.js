(function (scope) {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const family = type => {
    const t = normalize(type);
    if (t.includes('moletom')) return 'sweatshirt';
    if (t.includes('estonad')) return 'stonewashed';
    if (t.includes('peruano')) return 'peruvian';
    if (t.includes('oversized')) return 'oversized';
    if (t.includes('regata')) return 'tank';
    if (t.includes('cropped')) return 'cropped';
    if (t.includes('dry')) return 'dryfit';
    if (t.includes('ecobag')) return 'ecobag';
    if (t.includes('botton') || t.includes('bottom')) return 'bottoms';
    if (t.includes('caneca')) return 'mug';
    if (t === 'camiseta' || t.includes('algodao')) return 'cotton';
    return 'other';
  };
  const supplier = link => {
    try {
      const u = new URL(link);
      if (u.protocol !== 'https:') return null;
      if (['lojareservaink.obicha.com.br', 'www.reserva.ink', 'reserva.ink'].includes(u.hostname)) return 'reserva';
      if (['lojaumapenca.obicha.com.br', 'umapenca.com', 'www.umapenca.com'].includes(u.hostname)) return 'penca';
    } catch (_) {}
    return null;
  };
  const price = value => {
    const s = String(value || '').replace(/R\$\s*/g, '').trim();
    if (!/^\d{1,3}(?:\.\d{3})*,\d{2}$/.test(s)) return null;
    const n = Number(s.replace(/\./g, '').replace(',', '.'));
    return n > 0 ? n : null;
  };
  const formatPrice = value => new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
  const matchingVariants = (product, filters) => product.variants.filter(v => supplier(v.link) && (filters.model === 'all' || family(v.type) === filters.model) && (filters.store === 'all' || supplier(v.link) === filters.store));
  const filterProducts = (products, filters) => products.filter(p => {
    const query = normalize(filters.search);
    const text = normalize([p.name, p.originalName, ...p.collections].join(' '));
    return (!query || text.includes(query)) && (filters.collection === 'all' || p.collections.includes(filters.collection)) && matchingVariants(p, filters).length;
  });
  const MODEL_INFO = {
    cotton: {label:'Algodão tradicional', title:'O clássico do dia a dia.', kicker:'MANGA CURTA / MODELAGEM CLÁSSICA', description:'A camiseta de corte tradicional que você já conhece. O algodão também está em outras peças; aqui, a escolha é pelo modelo clássico.', material:'Malha de algodão. A composição pode variar com a cor e a peça.', fit:'Escolha se você prefere o caimento clássico. Veja os detalhes do modelo antes de comprar.'},
    peruvian: {label:'Algodão peruano', title:'O toque faz a diferença.', kicker:'MANGA CURTA / TECIDO PREMIUM', description:'Para quem coloca o toque macio e sedoso do tecido no topo da lista.', material:'100% algodão peruano.', fit:'Escolha pelo tecido. Confira a modelagem e as medidas antes de comprar.'},
    tank: {label:'Regata', title:'Braços livres. Atitude inteira.', kicker:'SEM MANGAS', description:'A opção para deixar os braços à mostra e vestir sua estampa nos dias de calor.', material:'Malha 100% algodão.', fit:'Escolha se você quer uma peça sem mangas.'},
    oversized: {label:'Oversized', title:'Mais espaço para ser você.', kicker:'MODELAGEM AMPLA', description:'O visual solto e amplo vem do desenho da peça. Não é só escolher uma camiseta clássica maior.', material:'100% algodão, com malha mais encorpada.', fit:'Escolha se você prefere um caimento amplo. Compare as medidas antes de comprar.'},
    sweatshirt: {label:'Moletom', title:'O deboche também sente frio.', kicker:'PARA OS DIAS MAIS FRESCOS', description:'Hoodie tem capuz; suéter não. O cropped moletom tem comprimento curto. Você escolhe a versão disponível para a estampa.', material:'Mistura de algodão e poliéster.', fit:'Escolha pelo formato: com capuz, sem capuz ou cropped.'},
    cropped: {label:'Cropped',title:'Curto no comprimento. Inteiro na atitude.',kicker:'COMPRIMENTO CURTO',description:'O que define o cropped é o comprimento. Para quem gosta de uma peça mais curta, com a estampa em destaque.',material:'Confira a composição do modelo escolhido na página do produto.',fit:'Compare comprimento e largura com uma peça que já veste bem em você.'},
    stonewashed: {label:'Estonada',title:'Algodão, com outro acabamento.',kicker:'LAVAGEM ESTONADA',description:'É algodão também. A lavagem dá à peça o visual estonado; o acabamento é a diferença em relação à camiseta tradicional.',material:'100% algodão penteado, com lavagem sutil.',fit:'Regular e Baby Long são escolhidas na página do produto. Confira o corte e as medidas na loja.'},
    dryfit: {label:'Dry fit',title:'Para o treino, com deboche.',kicker:'TECIDO PARA ATIVIDADE FÍSICA',description:'Tecido leve e de secagem rápida para acompanhar seus treinos. A composição é diferente das camisetas de algodão.',material:'100% poliéster.',fit:'Confira cores, modelagem e medidas na página do produto.'},
    ecobag: {label:'Ecobag',title:'Leve sua identidade junto.',kicker:'ACESSÓRIOS',description:'Sua estampa para carregar por aí. Dimensões e composição estão na página do produto.',material:'Confira material e dimensões na loja.',fit:'Escolha a estampa; os detalhes da bolsa ficam na página de compra.'},
    bottoms: {label:'Bottons',title:'Um detalhe. Muita atitude.',kicker:'ACESSÓRIOS',description:'Para dar personalidade à bolsa, à roupa ou ao que você quiser. Confira quantos bottons vêm no kit e suas dimensões na loja.',material:'Confira material, fecho e dimensões na loja.',fit:'Os kits e as estampas disponíveis variam por produto.'},
    mug: {label:'Caneca',title:'Até o café merece um deboche.',kicker:'ACESSÓRIOS',description:'Sua estampa também pode acompanhar o café. Capacidade, material e cuidados estão na página de cada caneca.',material:'Confira material e capacidade na loja.',fit:'O botão abre a caneca da estampa escolhida.'}
  };
  const detail = (type, store) => {
    const key = family(type);
    if (key === 'sweatshirt') {
      const t = normalize(type);
      return t.includes('hoodie') ? 'Moletom com capuz. Confira composição, caimento e medidas na loja.' : t.includes('cropped') ? 'Moletom de comprimento curto. Confira composição e medidas na loja.' : 'Moletom sem capuz. Confira composição, caimento e medidas na loja.';
    }
    if (store === 'penca' && key === 'cotton') return 'Camiseta tradicional da Uma Penca em 100% algodão. Escolha Regular ou Babylook e confira cores e medidas na loja.';
    if (store === 'reserva' && key === 'cotton') return 'Camiseta tradicional da Reserva Ink em malha de algodão. A cor cinza mescla contém poliéster. Confira corte, cores e medidas antes de comprar.';
    return MODEL_INFO[key]?.description || 'Confira os detalhes deste modelo na loja parceira.';
  };
  const guideInfo = key => MODEL_INFO[key];
  const api = {normalize, family, supplier, price, formatPrice, matchingVariants, filterProducts, MODEL_INFO, detail,guideInfo};
  scope.ObichaLogic = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
