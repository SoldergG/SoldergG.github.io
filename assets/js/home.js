/* Home: the Lunar phone story (same mechanics as lunar-escola.vercel.app) and the hero's exit. */
(() => {
  const { $, $$ } = Site;
  const story = $('.lunar');
  if (!story) return;
  const mobile = () => innerWidth < 1024;

  /* chapters switch the screen, with or without motion */
  let current = -1;
  function chapter(i){
    if (i === current) return;
    current = i;
    $$('.scr', story).forEach(s => s.classList.toggle('on', +s.dataset.i === i));
    $$('.ch', story).forEach(c => c.classList.toggle('is-on', +c.dataset.i === i));
    $$('.st-dots i', story).forEach((d, k) => d.classList.toggle('on', k === i));
  }
  let io, fitW = 0, fitH = 0;
  function fit(force){
    if (!force && innerWidth === fitW && Math.abs(innerHeight - fitH) < 140) return;
    fitW = innerWidth; fitH = innerHeight;
    const navH = 64, stage = $('.stage', story);
    const avail = mobile() ? innerHeight * .4 : innerHeight - navH - 120;
    const s = Math.max(.45, Math.min(1, avail / 640, (innerWidth - 48) / 300));
    $('.dev-wrap', story).style.setProperty('--s', s.toFixed(3));
    const stageH = stage.getBoundingClientRect().height;
    const top = mobile() ? Math.min(85, Math.round((navH + stageH) / innerHeight * 100) + 6) : 45;
    const bottom = mobile() ? Math.max(5, 100 - top - 14) : 45;
    if (io) io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) chapter(+e.target.dataset.i); }),
      { rootMargin: `-${top}% 0px -${bottom}% 0px` });
    $$('.ch', story).forEach(c => io.observe(c));
  }
  fit(true);
  chapter(0);
  addEventListener('resize', () => fit(false));

  /* hero showcase: Lucas, then each app. Advances on its own, pauses on hover, focus, the pause button,
     when off screen or in a hidden tab; with reduced motion it stays still and the dots switch slides. */
  const show = $('.show');
  if (show){
    const slides = $$('.show-slide', show), dots = $$('.show-dots button', show), pauseBtn = $('.show-pause', show);
    const DUR = 5200;
    let i = 0, timer = 0, left = DUR, startedAt = 0, userPaused = false, hover = false, visible = true;
    const still = Site.reduced;
    show.style.setProperty('--dur', DUR + 'ms');
    if (still) show.classList.add('still');
    function go(n){
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { const on = k === i; s.classList.toggle('on', on); s.setAttribute('aria-hidden', String(!on)); s.tabIndex = on ? 0 : -1; });
      dots.forEach((d, k) => {
        d.classList.toggle('past', k < i);
        d.setAttribute('aria-selected', String(k === i));
        const bar = d.firstElementChild; bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      });
      left = DUR; schedule();
    }
    const running = () => !still && !userPaused && !hover && visible && !document.hidden;
    function schedule(){
      clearTimeout(timer);
      show.classList.toggle('paused', !running());
      if (!running()) return;
      startedAt = performance.now();
      timer = setTimeout(() => go(i + 1), left);
    }
    function hold(){ if (timer && running()) left = Math.max(400, left - (performance.now() - startedAt)); clearTimeout(timer); timer = 0; }
    function update(){ hold(); schedule(); }
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', Site.t(userPaused ? 'show.play' : 'show.pause'));
      update();
    });
    Site.onLang(() => pauseBtn.setAttribute('aria-label', Site.t(userPaused ? 'show.play' : 'show.pause')));
    show.addEventListener('pointerenter', () => { hold(); hover = true; schedule(); });
    show.addEventListener('pointerleave', () => { hover = false; schedule(); });
    show.addEventListener('focusin', () => { hold(); hover = true; schedule(); });
    show.addEventListener('focusout', e => { if (!show.contains(e.relatedTarget)){ hover = false; schedule(); } });
    document.addEventListener('visibilitychange', update);
    new IntersectionObserver(([e]) => { hold(); visible = e.isIntersecting; schedule(); }).observe(show);
    go(0);
  }

  Site.ready(({ gsap, motion }) => {
    fit(true);
    if (!motion) return;

    /* hero: as the story arrives, the hero settles back and dims a touch */
    gsap.to('.hero-copy', { yPercent: -12, opacity: .35, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.facts', { yPercent: -24, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* the phone turns through the chapters (the Lunar site's poses, softer on mobile) */
    const k = mobile() ? .6 : 1;
    const poses = [[14, -26, 5], [5, -12, 1], [3, 11, -1], [7, -9, 1], [2, 6, 0]];
    const dev = $('#dev');
    gsap.set(dev, { rotationX: poses[0][0] * k, rotationY: poses[0][1] * k, rotationZ: poses[0][2] * k });
    const tl = gsap.timeline({ defaults: { ease: 'power1.inOut', duration: 1 },
      scrollTrigger: { trigger: '.story', start: 'top 64px', end: 'bottom bottom', scrub: true } });
    poses.slice(1).forEach(p => tl.to(dev, { rotationX: p[0] * k, rotationY: p[1] * k, rotationZ: p[2] * k }));
    gsap.from('.dev-wrap', { y: 80, opacity: 0, scale: .94, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.lunar', start: 'top 70%' } });

    /* featured: the copy follows the image, the TeeUp phones drift apart */
    $$('.feat').forEach(f => {
      $$('.tu-phone', f).forEach((p, n) => gsap.fromTo(p, { y: n ? -22 : 22 }, { y: n ? 22 : -22, ease: 'none',
        scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } }));
      const img = $('.feat-media img', f);
      if (img) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, ease: 'expo.out', duration: 1.8, scrollTrigger: { trigger: f, start: 'top 82%' } });
    });

    /* about: the portrait settles as it passes */
    gsap.fromTo('.portrait img', { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
})();
