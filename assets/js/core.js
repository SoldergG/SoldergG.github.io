/* Lucas Salvador · portfolio core, shared by every page.
   Language (EN/PT), nav, phone menu, contact panel, Lenis smooth scroll and the shared scroll reveals.
   Every page reads fine without it: it only adds motion, the Portuguese copy and the contact panel.
   A page adds its own strings in window.PAGE_PT and its own motion with Site.ready(fn). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
  };
  const EMAIL = 'Lucs2.8@icloud.com';
  const PHONE = '+351 933 258 349';

  const readyFns = [], langFns = [];
  const Site = window.Site = {
    $, $$, reduced, lenis: null, motion: false, lang: 'en',
    ready(fn){ readyFns.push(fn); },
    onLang(fn){ langFns.push(fn); },
    t: k => k
  };

  /* ── language ── */
  const COMMON_PT = {
    'skip': 'Saltar para o conteúdo',
    'nav.work': 'Trabalho', 'nav.about': 'Sobre', 'nav.contact': 'Contacto', 'nav.home': 'Início',
    'menu.open': 'Abrir menu', 'menu.close': 'Fechar menu',
    'foot.privacy': 'privacidade', 'foot.place': 'lisboa · portugal',
    'next.k': 'próximo projeto', 'back.all': 'Todo o trabalho',
    'cp.title': 'Vamos falar do teu projeto.',
    'cp.sub': 'Respondo em português, inglês ou espanhol, normalmente no próprio dia.',
    'cp.name': 'Nome', 'cp.email': 'O teu email', 'cp.kind': 'O que precisas',
    'cp.k.ios': 'App iOS', 'cp.k.web': 'Site ou web app', 'cp.k.both': 'App e site', 'cp.k.other': 'Outra coisa',
    'cp.msg': 'Conta-me a ideia', 'cp.msgph': 'O que queres construir, para quem e para quando.',
    'cp.send': 'Preparar email', 'cp.close': 'Fechar',
    'cp.note': 'Abre a tua app de email com a mensagem pronta. Nada é enviado sem carregares em enviar.',
    'cp.done.h': 'A mensagem está pronta.', 'cp.done.p': 'A tua app de email deve ter aberto com tudo preenchido. Se não abriu, copia a mensagem e envia para',
    'cp.copy': 'Copiar mensagem', 'cp.copied': 'Copiado', 'cp.again': 'Escrever outra',
    'cp.err.name': 'Escreve o teu nome.', 'cp.err.email': 'Escreve um email válido, por exemplo nome@exemplo.pt.', 'cp.err.msg': 'Conta-me um pouco da ideia.',
    'cp.direct': 'Ou escreve diretamente para',
    'cp.phone': 'Ou liga ou manda mensagem para'
  };
  const PT = Object.assign({}, COMMON_PT, window.PAGE_PT || {});
  const EN = {
    'menu.close': 'Close menu',
    'cp.title': 'Let’s talk about your project.',
    'cp.sub': 'I reply in English, Portuguese or Spanish, usually the same day.',
    'cp.name': 'Name', 'cp.email': 'Your email', 'cp.kind': 'What you need',
    'cp.k.ios': 'iOS app', 'cp.k.web': 'Website or web app', 'cp.k.both': 'App and website', 'cp.k.other': 'Something else',
    'cp.msg': 'Tell me the idea', 'cp.msgph': 'What you want to build, who it is for and when you need it.',
    'cp.send': 'Prepare email', 'cp.close': 'Close',
    'cp.note': 'Opens your email app with the message ready. Nothing is sent until you press send.',
    'cp.done.h': 'Your message is ready.', 'cp.done.p': 'Your email app should have opened with everything filled in. If it did not, copy the message and send it to',
    'cp.copy': 'Copy message', 'cp.copied': 'Copied', 'cp.again': 'Write another',
    'cp.err.name': 'Enter your name.', 'cp.err.email': 'Enter a valid email, for example name@example.com.', 'cp.err.msg': 'Tell me a little about the idea.',
    'cp.direct': 'Or write directly to',
    'show.play': 'Resume slideshow',
    'cp.phone': 'Or call or message'
  };
  const html = document.documentElement;
  const TITLE = { en: document.title, pt: html.dataset.titlePt || document.title };

  function collectEN(root = document){
    $$('[data-i18n]', root).forEach(el => { if (!(el.dataset.i18n in EN)) EN[el.dataset.i18n] = el.innerHTML; });
    $$('[data-i18n-label]', root).forEach(el => { if (!(el.dataset.i18nLabel in EN)) EN[el.dataset.i18nLabel] = el.getAttribute('aria-label'); });
    $$('[data-i18n-alt]', root).forEach(el => { if (!(el.dataset.i18nAlt in EN)) EN[el.dataset.i18nAlt] = el.getAttribute('alt'); });
    $$('[data-i18n-ph]', root).forEach(el => { if (!(el.dataset.i18nPh in EN)) EN[el.dataset.i18nPh] = el.getAttribute('placeholder'); });
  }
  const t = Site.t = k => (Site.lang === 'pt' ? PT[k] : EN[k]) ?? EN[k] ?? k;
  function apply(root = document){
    $$('[data-i18n]', root).forEach(el => { const v = t(el.dataset.i18n); if (el.innerHTML !== v) el.innerHTML = v; });
    $$('[data-i18n-label]', root).forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
    $$('[data-i18n-alt]', root).forEach(el => el.setAttribute('alt', t(el.dataset.i18nAlt)));
    $$('[data-i18n-ph]', root).forEach(el => el.setAttribute('placeholder', t(el.dataset.i18nPh)));
  }
  function setLang(next, save = true){
    Site.lang = next === 'pt' ? 'pt' : 'en';
    html.lang = Site.lang === 'pt' ? 'pt-PT' : 'en';
    apply();
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === Site.lang)));
    $$('.lang').forEach(g => g.setAttribute('aria-label', Site.lang === 'pt' ? 'Língua' : 'Language'));
    document.title = TITLE[Site.lang];
    syncMenuLabel();
    if (save) store.set('lang', Site.lang);
    langFns.forEach(fn => fn(Site.lang));
    if (window.ScrollTrigger && Site.motion) requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  /* ── phone menu ── */
  const menuBtn = $('#menuBtn'), links = $('#navLinks');
  function syncMenuLabel(){ if (menuBtn) menuBtn.setAttribute('aria-label', t(menuBtn.getAttribute('aria-expanded') === 'true' ? 'menu.close' : 'menu.open')); }
  function setMenu(open){
    if (!menuBtn) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    links.classList.toggle('open', open);
    syncMenuLabel();
  }
  if (menuBtn){
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', e => { if (e.target.closest('a,button')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  }

  /* ── contact panel: a native <dialog> sheet (Esc, backdrop and the close button dismiss it) ── */
  const panel = document.createElement('dialog');
  panel.className = 'cpanel';
  panel.setAttribute('aria-labelledby', 'cp-title');
  panel.innerHTML = `
    <div class="cp-in" data-lenis-prevent>
      <div class="cp-head">
        <h2 id="cp-title" data-i18n="cp.title">${EN['cp.title']}</h2>
        <button type="button" class="cp-x" data-i18n-label="cp.close" aria-label="${EN['cp.close']}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
      </div>
      <p class="cp-sub" data-i18n="cp.sub">${EN['cp.sub']}</p>
      <form class="cp-form" id="cpForm" novalidate>
        <div class="cp-row">
          <div class="cp-field"><label for="cp-name" data-i18n="cp.name">${EN['cp.name']}</label><input id="cp-name" name="name" autocomplete="name" required><p class="cp-err" id="cp-name-err" hidden></p></div>
          <div class="cp-field"><label for="cp-email" data-i18n="cp.email">${EN['cp.email']}</label><input id="cp-email" name="email" type="email" autocomplete="email" inputmode="email" required><p class="cp-err" id="cp-email-err" hidden></p></div>
        </div>
        <fieldset class="cp-kind">
          <legend data-i18n="cp.kind">${EN['cp.kind']}</legend>
          <div class="cp-chips">
            <label><input type="radio" name="kind" value="ios" id="cp-k-ios" checked><span data-i18n="cp.k.ios">${EN['cp.k.ios']}</span></label>
            <label><input type="radio" name="kind" value="web" id="cp-k-web"><span data-i18n="cp.k.web">${EN['cp.k.web']}</span></label>
            <label><input type="radio" name="kind" value="both" id="cp-k-both"><span data-i18n="cp.k.both">${EN['cp.k.both']}</span></label>
            <label><input type="radio" name="kind" value="other" id="cp-k-other"><span data-i18n="cp.k.other">${EN['cp.k.other']}</span></label>
          </div>
        </fieldset>
        <div class="cp-field"><label for="cp-msg" data-i18n="cp.msg">${EN['cp.msg']}</label><textarea id="cp-msg" name="msg" rows="5" required data-i18n-ph="cp.msgph" placeholder="${EN['cp.msgph']}"></textarea><p class="cp-err" id="cp-msg-err" hidden></p></div>
        <div class="cp-actions">
          <button class="btn" type="submit" data-i18n="cp.send">${EN['cp.send']}</button>
          <p class="cp-note" data-i18n="cp.note">${EN['cp.note']}</p>
        </div>
      </form>
      <div class="cp-done" id="cpDone" hidden>
        <h3 data-i18n="cp.done.h">${EN['cp.done.h']}</h3>
        <p><span data-i18n="cp.done.p">${EN['cp.done.p']}</span> <span class="mono sel">${EMAIL}</span>.</p>
        <div class="cta"><button type="button" class="btn" id="cpCopy" data-i18n="cp.copy">${EN['cp.copy']}</button><button type="button" class="btn ghost" id="cpAgain" data-i18n="cp.again">${EN['cp.again']}</button></div>
      </div>
      <div class="cp-direct">
        <p><span data-i18n="cp.direct">${EN['cp.direct']}</span> <span class="mono sel">${EMAIL}</span></p>
        <p><span data-i18n="cp.phone">${EN['cp.phone']}</span> <a class="mono" href="tel:${PHONE.replace(/\s/g, '')}">${PHONE}</a></p>
      </div>
    </div>`;
  document.body.appendChild(panel);
  let lastFocus = null, lastMail = '';
  function openPanel(){
    lastFocus = document.activeElement;
    setMenu(false);
    if (typeof panel.showModal === 'function') panel.showModal(); else panel.setAttribute('open', '');
    html.classList.add('cp-open');
    Site.lenis?.stop();
    setTimeout(() => $('#cp-name').focus({ preventScroll: true }), 60);
  }
  function closePanel(){
    if (!panel.open) return;
    panel.classList.add('closing');
    const done = () => { panel.classList.remove('closing'); panel.close(); };
    reduced ? done() : setTimeout(done, 280);
  }
  panel.addEventListener('close', () => { html.classList.remove('cp-open'); Site.lenis?.start(); lastFocus?.focus?.({ preventScroll: true }); });
  panel.addEventListener('cancel', e => { e.preventDefault(); closePanel(); });
  panel.addEventListener('click', e => { if (e.target === panel || e.target.closest('.cp-x')) closePanel(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-contact]');
    if (a){ e.preventDefault(); openPanel(); }
  });
  if (location.hash === '#write') requestAnimationFrame(openPanel);

  const form = $('#cpForm', panel);
  function showErr(id, key){
    const p = $('#' + id + '-err', panel), input = $('#' + id, panel);
    if (key){ p.textContent = t(key); p.hidden = false; input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id + '-err'); }
    else { p.hidden = true; input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    return !key;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim(), email = form.email.value.trim(), msg = form.msg.value.trim();
    const kind = t('cp.k.' + (form.kind.value || 'other'));
    const ok = [
      showErr('cp-name', name ? '' : 'cp.err.name'),
      showErr('cp-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'cp.err.email'),
      showErr('cp-msg', msg.length >= 8 ? '' : 'cp.err.msg')
    ];
    if (ok.includes(false)){ $('[aria-invalid="true"]', panel)?.focus(); return; }
    const subject = `${kind} · ${name}`;
    lastMail = `${msg}\n\n${name}\n${email}`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lastMail)}`;
    form.hidden = true;
    $('#cpDone', panel).hidden = false;
    $('#cpCopy', panel).focus();
  });
  $('#cpCopy', panel).addEventListener('click', e => {
    const b = e.currentTarget;
    navigator.clipboard?.writeText(lastMail).then(() => { b.textContent = t('cp.copied'); setTimeout(() => (b.textContent = t('cp.copy')), 1800); }).catch(() => {});
  });
  $('#cpAgain', panel).addEventListener('click', () => { form.reset(); form.hidden = false; $('#cpDone', panel).hidden = true; $('#cp-name', panel).focus(); });

  /* language buttons and first paint */
  collectEN();
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  const saved = store.get('lang');
  setLang(saved || ((navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en'), false);

  /* ── nav hairline ── */
  const nav = $('#nav');
  const onScroll = y => nav && nav.classList.toggle('scrolled', y > 8);
  addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);
  Site.onScroll = onScroll;

  /* ── shared motion ──
     data-reveal="words"  headline words rise out of a mask
     data-reveal="up"     element rises and fades in
     data-reveal="stagger" children rise in sequence
     data-reveal="shutter" media opens from an inset frame
     data-speed="0.1"     element drifts against the scroll (parallax) */
  function splitWords(el){
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3){
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
    return $$('.wi', el);
  }

  addEventListener('load', () => {
    const { gsap, ScrollTrigger, Lenis } = window;
    const ctx = { gsap, ScrollTrigger, motion: false, $, $$ };
    if (!reduced && gsap && ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      gsap.config({ force3D: true });
      Site.motion = ctx.motion = true;
      html.classList.add('js-motion');
      if (Lenis){
        const lenis = Site.lenis = new Lenis({ autoRaf: false, lerp: .14, wheelMultiplier: 1.05, touchMultiplier: 1, anchors: { offset: -64 }, stopInertiaOnNavigate: true });
        lenis.on('scroll', ScrollTrigger.update);
        lenis.on('scroll', e => onScroll(e.scroll));
        gsap.ticker.add(time => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }
      const ease = 'expo.out';
      $$('[data-reveal="words"]').forEach(el => {
        const words = splitWords(el);
        const onLoad = el.closest('.hero, .cs-hero');
        gsap.from(words, { yPercent: 110, duration: 1.25, ease, stagger: .045, delay: onLoad ? .1 : 0,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: 'top 85%' } });
      });
      $$('[data-reveal="up"]').forEach(el => gsap.from(el, { y: 28, opacity: 0, duration: 1.1, ease,
        scrollTrigger: el.closest('.hero, .cs-hero') ? undefined : { trigger: el, start: 'top 88%' }, delay: el.closest('.hero, .cs-hero') ? .35 : 0 }));
      $$('[data-reveal="stagger"]').forEach(el => gsap.from(el.children, { y: 22, opacity: 0, duration: 1, ease, stagger: .06,
        scrollTrigger: { trigger: el, start: 'top 86%' } }));
      $$('[data-reveal="shutter"]').forEach(el => gsap.fromTo(el, { clipPath: 'inset(10% 10% 10% 10% round 18px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.5, ease, scrollTrigger: { trigger: el, start: 'top 82%' } }));
      $$('[data-speed]').forEach(el => {
        const s = parseFloat(el.dataset.speed) || .1;
        gsap.fromTo(el, { yPercent: 0 }, { yPercent: -s * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
    readyFns.forEach(fn => { try { fn(ctx); } catch (err) { console.error(err); } });
    if (Site.motion) ScrollTrigger.refresh();
  });
})();
