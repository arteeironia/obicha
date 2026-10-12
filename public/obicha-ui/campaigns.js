window.mountObichaCampaigns = function(content, section) {
  const controller = new AbortController();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const destination = href => {
    try { return new URL(href, location.href).origin !== location.origin; } catch { return false; }
  };
  const picture = b => `<picture>${b.mobile ? `<source media="(max-width: 650px)" srcset="${esc(b.mobile)}">` : ''}<img src="${esc(b.desktop)}" alt="${esc(b.title)}" loading="lazy"></picture>`;
  const link = (b, label, cls) => `<a class="${cls}" href="${esc(b.href)}"${destination(b.href)?' target="_blank" rel="noopener noreferrer"':''}>${esc(label)} <span aria-hidden="true">${destination(b.href)?'↗':'→'}</span></a>`;
  const live = b => b.state === 'active' && (!b.start || Date.parse(b.start) <= Date.now()) && (!b.end || Date.parse(b.end) > Date.now());
  const banners = (content.banners || []).filter(b => content.preview || live(b));
  const inline = banners.filter(b => b.display !== 'popup');
  const popup = banners.find(b => ['popup','both'].includes(b.display));
  section.hidden = !banners.length;
  section.innerHTML = banners.length ? `<div class="campaign-heading"><div><p class="eyebrow">TEM COISA BOA ROLANDO</p><h2>Vantagens pra você.</h2></div>${popup?'<button type="button" class="button outline" data-open-campaign>Ver promoção</button>':''}</div><div class="campaign-grid">${inline.map(b => `<article class="promotion-banner">${link(b, b.title, 'campaign-image-link').replace(esc(b.title), picture(b))}<div class="banner-caption"><strong>${esc(b.title)}</strong>${link(b,b.cta,'button campaign-cta')}</div></article>`).join('')}</div>` : '';
  // Keep the campaign section near the beginning of the page, before the product hero.
  const hero = document.querySelector('main .hero');
  if (hero) hero.before(section);
  let timer, dialog, lastFocus;
  const key = popup ? 'obicha-campaign:' + popup.id + ':' + (popup.start || '') : '';
  const remember = () => { if (!content.preview) try { localStorage.setItem(key, String(Date.now())); } catch {} };
  if (popup) {
    dialog = document.createElement('dialog');
    dialog.className = 'campaign-dialog';
    dialog.setAttribute('aria-labelledby','campaign-dialog-title');
    dialog.innerHTML = `<button type="button" class="campaign-close" aria-label="Fechar promoção">×</button>${picture(popup)}<div class="campaign-dialog-copy"><p class="eyebrow">Ô BICHA! TEM VANTAGEM</p><h2 id="campaign-dialog-title">${esc(popup.title)}</h2>${link(popup,popup.cta,'button red')}<button type="button" class="text-link" data-continue-shopping>Continuar explorando</button></div>`;
    section.append(dialog);
    const open = () => {
      if (!content.preview && !live(popup)) return;
      if (document.querySelector('dialog[open]') || document.hidden) return;
      lastFocus = document.activeElement;
      dialog.showModal();
      remember();
      dialog.querySelector('.campaign-close').focus();
    };
    dialog.querySelector('.campaign-close').addEventListener('click',()=>dialog.close(),{signal:controller.signal});
    dialog.querySelector('[data-continue-shopping]').addEventListener('click',()=>dialog.close(),{signal:controller.signal});
    dialog.addEventListener('close',()=>lastFocus?.focus(),{signal:controller.signal});
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}},{signal:controller.signal});
    section.querySelector('[data-open-campaign]').addEventListener('click',open,{signal:controller.signal});
    let seen = false;
    try { const t = Number(localStorage.getItem(key)); seen = t > 0 && Date.now()-t < 86400000; } catch {}
    if (content.preview || !seen) timer = setTimeout(open,5000);
  }
  return () => { clearTimeout(timer); controller.abort(); dialog?.close(); dialog?.remove(); };
};
