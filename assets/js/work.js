/* Work index: filters, and a preview that trails the pointer over projects that have one. */
(() => {
  const { $, $$ } = Site;
  const items = $$('.wlist li');
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f;
    items.forEach(li => { li.hidden = f !== 'all' && !li.dataset.tags.split(' ').includes(f); });
    if (Site.motion) window.gsap.fromTo(items.filter(li => !li.hidden), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'expo.out', stagger: .04 });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  Site.ready(({ gsap, motion }) => {
    const peek = $('.peek');
    if (!motion || !peek || !matchMedia('(hover: hover) and (min-width: 900px)').matches) return;
    const imgs = $$('img', peek);
    const xTo = gsap.quickTo(peek, 'x', { duration: .55, ease: 'power3' });
    const yTo = gsap.quickTo(peek, 'y', { duration: .55, ease: 'power3' });
    addEventListener('pointermove', e => { xTo(e.clientX + 24); yTo(e.clientY); }, { passive: true });
    gsap.set(peek, { xPercent: 0, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2, scale: .86 });
    $$('.wlist a').forEach(a => {
      a.addEventListener('pointerenter', () => {
        const src = a.dataset.peek;
        if (!src) return;
        imgs.forEach(i => i.classList.toggle('on', i.dataset.src === src));
        peek.classList.add('on');
        gsap.to(peek, { scale: 1, duration: .5, ease: 'expo.out' });
      });
      a.addEventListener('pointerleave', () => { peek.classList.remove('on'); gsap.to(peek, { scale: .86, duration: .4, ease: 'power2.out' }); });
    });
  });
})();
