/* Case studies: each page has its own pinned scroll story.
   lunar: the phone zooms out of the window, then a horizontal run of screens
   solarcalc: the screenshot opens to the full window, then a sun crosses the sky
   teeup: nine holes play out on the scroll
   podcast-helper: three recorded tracks fall into sync */
(() => {
  const { $, $$ } = Site;
  const page = document.documentElement.dataset.page;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* the small Lunar phones in the horizontal run scale their 300px screens to the frame */
  function fitMinis(){
    $$('.lunar-mini').forEach(m => {
      const s = m.clientWidth * .98 / 300;
      $('.mini-scr', m).style.transform = `scale(${s})`;
    });
  }
  fitMinis();
  addEventListener('resize', fitMinis);

  /* waveforms for Podcast Helper, drawn once per size */
  function drawWaves(offsets = []){
    $$('.wave canvas').forEach((c, i) => {
      const dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
      if (!w) return;
      c.width = w * dpr; c.height = h * dpr;
      const g = c.getContext('2d'); g.scale(dpr, dpr);
      let seed = +c.dataset.seed * 9301;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      g.fillStyle = c.dataset.color;
      const bars = Math.floor(w / 4), off = offsets[i] || 0;
      for (let b = 0; b < bars; b++){
        const talk = Math.sin((b + i * 37) / 23) > -.2 ? 1 : .18;
        const a = (.15 + rnd() * .85) * talk;
        const bh = Math.max(2, a * (h - 10));
        g.globalAlpha = .9;
        g.fillRect(b * 4 + off, (h - bh) / 2, 2, bh);
      }
    });
  }

  Site.ready(({ gsap, ScrollTrigger, motion }) => {
    if (!motion){ document.documentElement.classList.add('no-motion'); drawWaves(); return; }
    const scrub = (trigger, onUpdate, extra = {}) => ScrollTrigger.create({ trigger, start: 'top top+=64', end: 'bottom bottom', scrub: true, onUpdate: s => onUpdate(s.progress), ...extra });

    /* ── Lunar ── */
    if (page === 'lunar'){
      const zp = $('.zoom-phone'), copy = $('.zoom-copy');
      const fill = () => Math.max(innerWidth / 300, (innerHeight - 64) / 640) * 1.08;
      gsap.set(copy, { opacity: 0, y: 24 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.zoom', start: 'top top+=64', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
      tl.fromTo(zp, { scale: () => fill(), rotationX: 0, rotationY: 0 }, { scale: () => Math.min(.92, (innerHeight - 64 - 250) / 640), y: () => -Math.min(70, innerHeight * .07), ease: 'power2.inOut', duration: 1 })
        .to(zp, { rotationY: -14, rotationX: 6, ease: 'power1.inOut', duration: .6 }, .55)
        .to(copy, { opacity: 1, y: 0, duration: .3, ease: 'power2.out' }, .95);
      zp.style.transformStyle = 'preserve-3d';

      const track = $('.h-track'), cur = $('.h-cur'), items = $$('.h-item');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + 48);
      gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.hscroll', start: 'top top+=64', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
          onUpdate: s => { cur.textContent = String(Math.min(items.length, 1 + Math.floor(s.progress * items.length * .999))).padStart(2, '0'); } } });
      items.forEach((it, i) => gsap.fromTo(it, { rotationY: 18, opacity: .55 }, { rotationY: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.hscroll', start: () => `top+=${i * innerHeight * .55} top`, end: () => `top+=${i * innerHeight * .55 + innerHeight * .6} top`, scrub: true, invalidateOnRefresh: true } }));
    }

    /* ── SolarCalc ── */
    if (page === 'solarcalc'){
      const img = $('.bleed-img');
      gsap.fromTo(img, { clipPath: 'inset(14% 18% 14% 18% round 18px)', scale: 1.04 },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.bleed', start: 'top top+=64', end: 'bottom bottom', scrub: true } });

      const sky = $('.sky'), sun = $('.sun'), arc = $('#arc'), done = $('.arc-done'), steps = $$('.sky-step');
      const len = arc.getTotalLength();
      done.style.strokeDasharray = len; done.style.strokeDashoffset = len;
      const panels = $('.panels');
      let active = 0;
      scrub(sky, p => {
        const pt = arc.getPointAtLength(len * clamp(p * 1.05, 0, 1));
        sun.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        done.style.strokeDashoffset = len * (1 - clamp(p * 1.05, 0, 1));
        const warm = Math.sin(clamp(p, 0, 1) * Math.PI);
        sky.style.setProperty('--warm', warm.toFixed(3));
        panels.style.opacity = (.45 + warm * .55).toFixed(2);
        const i = Math.min(steps.length - 1, Math.floor(p * steps.length));
        if (i !== active){ steps.forEach((s, k) => s.classList.toggle('on', k === i)); active = i; }
      });
      const p0 = arc.getPointAtLength(0); sun.setAttribute('transform', `translate(${p0.x} ${p0.y})`);
    }

    /* ── TeeUp ── */
    if (page === 'teeup'){
      const par = [4, 3, 5, 4, 4, 3, 4, 5, 4], score = [4, 3, 6, 4, 3, 3, 5, 5, 4];
      const names = { '-2': 'eagle', '-1': 'birdie', '0': 'par', '1': 'bogey', '2': 'double bogey' };
      const namesPt = { '-2': 'eagle', '-1': 'birdie', '0': 'par', '1': 'bogey', '2': 'duplo bogey' };
      const line = $('.shot-line'), ball = $('.ball'), bs = $('.bs'), bl = $('.bs-l'), hn = $('.hn'), hp = $('.hp'), cells = $$('.card9 .sc');
      const len = line.getTotalLength();
      line.style.strokeDasharray = `${len}`; line.style.strokeDashoffset = `${len}`;
      let hole = -1;
      scrub('.round', p => {
        const x = clamp(p, 0, .9999) * 9, h = Math.floor(x), f = clamp((x - h) * 1.25, 0, 1);
        line.style.strokeDashoffset = len * (1 - f);
        const pt = line.getPointAtLength(len * f);
        ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y);
        if (h !== hole){
          hole = h;
          bs.textContent = score[h];
          const d = String(score[h] - par[h]);
          bl.textContent = `${(Site.lang === 'pt' ? namesPt : names)[d] || ''} · ${Site.lang === 'pt' ? 'buraco' : 'hole'} ${h + 1}`;
          hn.textContent = h + 1; hp.textContent = par[h];
          cells.forEach((c, k) => { c.classList.toggle('on', k === h); c.classList.toggle('done', k < h); });
          gsap.fromTo(bs, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out' });
        }
      });
    }

    /* ── Podcast Helper ── */
    if (page === 'podcast-helper'){
      const start = [64, -48, 30];
      drawWaves(start);
      addEventListener('resize', () => drawWaves(start));
      const steps = $$('.sync-step'), head = $('.playhead'), tc = $('.tc'), tracks = $$('.track .wave canvas');
      const waveW = () => $('.wave').clientWidth;
      let active = 0;
      scrub('.sync', p => {
        const i = Math.min(3, Math.floor(p * 4));
        if (i !== active){ steps.forEach((s, k) => s.classList.toggle('on', k === i)); active = i; }
        // step 3 slides every track onto the reference clock
        const align = clamp((p - .5) / .2, 0, 1);
        tracks.forEach((c, k) => { c.style.transform = `translateX(${-start[k] * align}px)`; });
        head.style.transform = `translateX(${clamp(p, 0, 1) * (waveW() - 2)}px)`;
        const ms = Math.round(p * 47 * 60 * 1000);
        const hh = String(Math.floor(ms / 3600000)).padStart(2, '0'), mm = String(Math.floor(ms / 60000) % 60).padStart(2, '0'),
          ss = String(Math.floor(ms / 1000) % 60).padStart(2, '0'), mmm = String(ms % 1000).padStart(3, '0');
        tc.textContent = `${hh}:${mm}:${ss}.${mmm}`;
      });
    }
  });

  /* Podcast waves still draw without motion (and before load) */
  if (page === 'podcast-helper') addEventListener('DOMContentLoaded', () => drawWaves([64, -48, 30]));
})();
