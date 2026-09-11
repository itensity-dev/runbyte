/* ==========================================================================
   Runbyte — interactions
   GSAP 3.13 (ScrollTrigger, SplitText, CustomEase) + Lenis smooth scroll.
   ========================================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('out', '0.16, 1, 0.3, 1');
  CustomEase.create('inOut', '0.76, 0, 0.24, 1');
  gsap.defaults({ ease: 'out', duration: 1 });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
    else {
      const el = typeof target === 'string' ? $(target) : target;
      (el || window).scrollIntoView ? el.scrollIntoView({ behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ---------- Anchors ---------- */
  $$('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollTo(el);
      history.replaceState(null, '', id);
    });
  });
  $('#toTop')?.addEventListener('click', () => scrollTo(0));

  /* ---------- Local time (studio clock) ---------- */
  const tick = () => {
    const now = new Date();
    const str = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(now);
    const s = `ZRH ${str}`;
    const a = $('#localTime'); const b = $('#footerTime');
    if (a) a.textContent = s;
    if (b) b.textContent = `${str} CET`;
  };
  tick(); setInterval(tick, 15000);

  /* ---------- Marquee: duplicate content for a seamless loop ---------- */
  $$('[data-marquee]').forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Split text (lines) ---------- */
  const splits = new Map();
  $$('[data-split]').forEach((el) => {
    const inHero = el.closest('.hero') !== null;
    const split = SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit(self) {
        if (reduce) return;
        const tw = gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.4,
          stagger: 0.09,
          ease: 'out',
          paused: inHero,
          scrollTrigger: inHero ? null : { trigger: el, start: 'top 85%', once: true }
        });
        if (inHero) splits.set(el, tw);
        return tw;
      }
    });
  });

  /* ---------- Generic reveals ---------- */
  if (!reduce) {
    ScrollTrigger.batch('[data-reveal]:not(.hero [data-reveal])', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => batch.forEach((el, i) => setTimeout(() => el.classList.add('is-in'), i * 90))
    });

    $$('[data-clip]').forEach((el) => {
      const img = $('img', el);
      const inHero = el.closest('.hero') !== null;
      const tl = gsap.timeline({
        paused: inHero,
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 82%', once: true }
      });
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'inOut' }, 0)
        .to(img, { scale: 1, duration: 1.8, ease: 'out' }, 0.05);
      if (inHero) splits.set(el, tl);
    });

    $$('[data-parallax]').forEach((img) => {
      const k = parseFloat(img.dataset.parallax) || 0.15;
      gsap.fromTo(img, { yPercent: -k * 50 }, {
        yPercent: k * 50, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  } else {
    $$('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Manifesto: word-by-word fill on scroll ---------- */
  $$('[data-fill]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word', autoSplit: true,
      onSplit(self) {
        if (reduce) { self.words.forEach(w => w.style.opacity = 1); return; }
        return gsap.to(self.words, {
          opacity: 1, stagger: 0.05, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 }
        });
      }
    });
  });

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    if (reduce) { el.textContent = end; return; }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v); }
    });
  });

  /* ---------- Services: accordion + floating preview ---------- */
  const preview = $('#servicePreview');
  const previewImg = preview ? $('img', preview) : null;
  const services = $$('.service');
  services.forEach((li) => {
    const btn = $('.service__row', li);
    btn.addEventListener('click', () => {
      const open = li.classList.contains('is-open');
      services.forEach((o) => { o.classList.remove('is-open'); $('.service__row', o).setAttribute('aria-expanded', 'false'); });
      if (!open) { li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
      setTimeout(() => ScrollTrigger.refresh(), 650);
    });
  });
  if (preview && fine && !reduce) {
    const px = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3' });
    const pr = gsap.quickTo(preview, 'rotation', { duration: 0.6, ease: 'power3' });
    let lastX = 0; let shown = false;
    const list = $('#servicesList');
    list.addEventListener('mousemove', (e) => {
      px(e.clientX + 28); py(e.clientY - 120);
      pr(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4)); lastX = e.clientX;
    });
    services.forEach((li) => {
      li.addEventListener('mouseenter', () => {
        const src = li.dataset.img;
        if (src && previewImg.getAttribute('src') !== src) previewImg.src = src;
        if (!shown) { shown = true; gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: 'out' }); }
      });
    });
    list.addEventListener('mouseleave', () => {
      shown = false; gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'out' });
    });
  }

  /* ---------- Work: horizontal scroll (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const pin = $('#workPin'); const track = $('#workTrack');
    if (!pin || !track) return;
    const getDist = () => {
      const pad = parseFloat(getComputedStyle(pin.closest('.section')).paddingLeft) || 0;
      return Math.max(0, track.scrollWidth - window.innerWidth + pad * 2);
    };
    const tween = gsap.to(track, {
      x: () => -getDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true, scrub: 0.8,
        start: 'top top',
        end: () => '+=' + getDist(),
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
    $$('.project__figure img', track).forEach((img) => {
      gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: img.parentElement, start: 'left right', end: 'right left', scrub: true } });
    });
  });

  /* ---------- Process: stacking cards ---------- */
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const steps = $$('#processStack .step');
    steps.forEach((step, i) => {
      if (i === steps.length - 1) return;
      const next = steps[i + 1];
      gsap.to(step, {
        scale: 0.94 + i * 0.01, filter: 'brightness(0.82)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=' + (72 + 24 * (i + 1)), scrub: true }
      });
    });
  });

  /* ---------- Quotes slider ---------- */
  (() => {
    const quotes = $$('#quotes .quote'); if (!quotes.length) return;
    let i = 0; let busy = false; let timer;
    const count = $('#quoteCount');
    const pad = (n) => String(n).padStart(2, '0');
    const go = (dir) => {
      if (busy) return; busy = true;
      const cur = quotes[i]; i = (i + dir + quotes.length) % quotes.length; const nxt = quotes[i];
      count.textContent = `${pad(i + 1)} / ${pad(quotes.length)}`;
      if (reduce) { cur.classList.remove('is-active'); nxt.classList.add('is-active'); busy = false; return; }
      gsap.to(cur, { opacity: 0, y: -16 * dir, duration: 0.45, ease: 'power2.in', onComplete: () => {
        cur.classList.remove('is-active'); gsap.set(cur, { clearProps: 'all' });
        nxt.classList.add('is-active');
        gsap.fromTo(nxt, { opacity: 0, y: 24 * dir }, { opacity: 1, y: 0, duration: 0.8, ease: 'out', onComplete: () => { busy = false; } });
      }});
    };
    const arm = () => { clearInterval(timer); timer = setInterval(() => go(1), 7000); };
    $('#quoteNext').addEventListener('click', () => { go(1); arm(); });
    $('#quotePrev').addEventListener('click', () => { go(-1); arm(); });
    arm();
  })();

  /* ---------- FAQ: animated <details> ---------- */
  $$('.faq__item').forEach((d) => {
    const summary = $('summary', d); const body = $('.faq__body', d);
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (reduce) { d.open = !d.open; return; }
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.45, ease: 'inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'all' }); } });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, opacity: 0, duration: 0.6, ease: 'inOut', onComplete: () => { gsap.set(body, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
      }
    });
  });

  /* ---------- Nav: hide on scroll down ---------- */
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (y > 120 && y > lastY + 4 && !menuOpen) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 120) nav.classList.remove('is-hidden');
      lastY = y;
    }
  });

  /* ---------- Mobile menu ---------- */
  const menu = $('#menu'); const burger = $('#burger'); let menuOpen = false;
  const menuLinks = $$('.menu__links a', menu);
  const openMenu = () => {
    menuOpen = true; burger.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false'); nav.classList.remove('is-hidden');
    lenis?.stop();
    gsap.set(menu, { visibility: 'visible' });
    gsap.timeline()
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'inOut' })
      .from(menuLinks, { yPercent: 60, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'out' }, '-=0.4');
  };
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    lenis?.start();
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
  }
  burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Custom cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && fine && !reduce) {
    const label = $('.cursor__label span', cursor);
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); cursor.classList.remove('is-hidden'); });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    const hoverables = 'a, button, summary, .service__row, .stack__group li';
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cursor.classList.add('is-label'); return; }
      if (e.target.closest(hoverables)) cursor.classList.add('is-link');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('[data-cursor]')) cursor.classList.remove('is-label');
      if (e.target.closest(hoverables)) cursor.classList.remove('is-link');
    });
  }

  /* ---------- Magnetic elements ---------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 0.35;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Footer wordmark parallax ---------- */
  if (!reduce) {
    const word = $('.footer__word span');
    if (word) gsap.fromTo(word, { yPercent: 30 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- Loader + hero intro ---------- */
  const loader = $('#loader');
  const introHero = () => {
    document.body.classList.remove('is-loading');
    lenis?.start();
    const tl = gsap.timeline();
    splits.forEach((tw, el) => {
      const at = el.matches('h1') ? 0 : el.hasAttribute('data-clip') ? 0.35 : 0.2;
      tl.add(tw.play(), at);
    });
    tl.add(() => $$('.hero [data-reveal]').forEach((el, i) => setTimeout(() => el.classList.add('is-in'), i * 120)), 0.5);
    tl.from('.hero__top', { opacity: 0, y: -10, duration: 1 }, 0.3);
    tl.add(() => nav.classList.remove('is-pre'), 0.4);
    ScrollTrigger.refresh();
  };

  if (loader && !reduce) {
    lenis?.stop();
    const seen = sessionStorage.getItem('rb-loaded');
    const count = $('#loaderCount'); const bar = $('#loaderBar');
    const obj = { v: 0 };
    const dur = seen ? 0.9 : 2.1;
    const tl = gsap.timeline({ onComplete: () => sessionStorage.setItem('rb-loaded', '1') });
    tl.to('.loader__text', { y: 0, duration: 1.2, ease: 'out' }, 0)
      .to(obj, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(obj.v)).padStart(3, '0'); } }, 0)
      .to(bar, { scaleX: 1, duration: dur, ease: 'power2.inOut' }, 0)
      .to('.loader__text', { yPercent: -110, duration: 0.8, ease: 'inOut' }, dur + 0.15)
      .to('.loader__meta, .loader__bar', { opacity: 0, duration: 0.4 }, dur + 0.15)
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'inOut' }, dur + 0.35)
      .add(introHero, dur + 0.55)
      .set(loader, { display: 'none' });
  } else {
    if (loader) loader.style.display = 'none';
    document.body.classList.remove('is-loading');
    nav.classList.remove('is-pre');
    splits.forEach((tw) => tw.progress(1));
    $$('.hero [data-reveal]').forEach((el) => el.classList.add('is-in'));
    ScrollTrigger.refresh();
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
