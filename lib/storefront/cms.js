const MAX_FEATURED = 12;
function bannerStatus(b, now = Date.now()) {
  if (b.state === 'paused') return 'Pausado';
  if (b.state !== 'active') return 'Rascunho';
  if (b.end && Date.parse(b.end) <= now) return 'Encerrado';
  if (b.start && Date.parse(b.start) > now) return 'Agendado';
  return 'No ar';
}
function visibleBanners(config, now = Date.now(), preview = false) {
  return config.banners.filter(b => b.desktop && b.title && b.href && (preview ? b.state !== 'paused' : bannerStatus(b, now) === 'No ar'));
}
function safeDestination(value) {
  if (typeof value !== 'string' || /[\x00-\x20\\]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && ['umapenca.com','www.umapenca.com','lojaumapenca.obicha.com.br','lojareservaink.obicha.com.br','reserva.ink','www.reserva.ink','www.obicha.com.br','obicha.com.br','institutoamargen.com.br'].includes(u.hostname); } catch { return false; }
}
function safeImage(value) {
  if(typeof value !== 'string')return false; if(value==='')return true; try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='res.cloudinary.com'&&!u.username&&!u.password;}catch{return false;}
}
function validateContent(input, productIds, publishing = false) {
  const errors = []; const ids = new Set(productIds);
  const short = (v, max) => typeof v === 'string' && v.length <= max;
  if (!input || typeof input !== 'object') return ['Conteúdo inválido.'];
  const h = input.hero;
  if (!h || !ids.has(h.productId)) errors.push('Escolha uma estampa principal do catálogo.');
  if (!h || !short(h.title, 140) || !h.title.trim() || !short(h.description, 600) || !short(h.caption, 160) || !safeImage(h.image)) errors.push('Revise os textos ou a imagem do destaque principal.');
  if (!Array.isArray(input.featured) || input.featured.length > MAX_FEATURED || new Set(input.featured).size !== input.featured.length || input.featured.some(id => !ids.has(id))) errors.push('Escolha até 12 estampas diferentes para os destaques.');
  if (!Array.isArray(input.banners) || input.banners.length > 10) return [...errors, 'Use até 10 banners.'];
  const bannerIds = new Set();
  for (const [i,b] of input.banners.entries()) {
    const label = `Banner ${i+1}`;
    if (!b || !short(b.id, 80) || !b.id || bannerIds.has(b.id)) { errors.push(`${label}: identificação inválida.`); continue; }
    bannerIds.add(b.id);
    if (!short(b.title, 140) || !short(b.cta, 60) || !short(b.href, 2000) || !['draft','active','paused'].includes(b.state) || !safeImage(b.desktop) || !safeImage(b.mobile)) errors.push(`${label}: revise textos, estado e imagens.`);
    if (b.href && !safeDestination(b.href)) errors.push(`${label}: destino inválido. Use uma página interna ou uma loja parceira.`);
    for (const key of ['start','end']) if (typeof b[key] !== 'string' || (b[key] && (!/Z$/.test(b[key]) || !Number.isFinite(Date.parse(b[key]))))) errors.push(`${label}: data inválida.`);
    if (b.start && b.end && Date.parse(b.end) <= Date.parse(b.start)) errors.push(`${label}: o fim deve ser depois do início.`);
    if (publishing && b.state === 'active' && (!(typeof b.title==='string'&&b.title.trim()) || !(typeof b.cta==='string'&&b.cta.trim()) || !b.desktop || !b.href)) errors.push(`${label}: para ativar, inclua título, imagem de computador, botão e destino.`);
  }
  return errors;
}
// The control is explicitly São Paulo time, independent of the editor's device.
function fromSaoPaulo(value) {
  return value ? new Date(value + ':00-03:00').toISOString() : '';
}
function toSaoPaulo(value) {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
  return parts.replace(' ', 'T');
}


export {bannerStatus,validateContent,fromSaoPaulo,toSaoPaulo,visibleBanners};
