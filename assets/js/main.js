/* ==========================================================================
   Runbyte v2 — interactions
   GSAP 3.13 (ScrollTrigger, SplitText, ScrambleText, CustomEase) + Lenis
   ========================================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const YELLOW = '#ffc940';
  const FG = '#f2f1ec';

  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
  CustomEase.create('out', '0.16, 1, 0.3, 1');
  CustomEase.create('inOut', '0.76, 0, 0.24, 1');
  gsap.defaults({ ease: 'out', duration: 1 });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
  };
  $$('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const el = $(id); if (!el) return;
      e.preventDefault(); closeMenu(); scrollTo(el); history.replaceState(null, '', id);
    });
  });
  $('#toTop')?.addEventListener('click', () => scrollTo(0));

  /* ---------- Clock ---------- */
  const tick = () => {
    const str = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(new Date());
    ['#localTime', '#menuTime'].forEach((s) => { const el = $(s); if (el) el.textContent = `ZRH ${str}`; });
    const f = $('#footerTime'); if (f) f.textContent = `${str} CET`;
  };
  tick(); setInterval(tick, 15000);

  /* ---------- Marquee ---------- */
  $$('[data-marquee]').forEach((t) => { t.innerHTML += t.innerHTML; });

  /* =========================================================================
     Split-flap board
     ========================================================================= */
  const ALPHA = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function createFlapBoard(el, word) {
    el.classList.add('flap-board');
    el.innerHTML = '';
    const cells = word.split('').map((ch) => {
      const c = document.createElement('span');
      c.className = 'flap'; c.textContent = ch; el.appendChild(c);
      c.addEventListener('animationend', () => c.classList.remove('is-tick'));
      return { el: c, target: ALPHA.indexOf(ch), cur: ALPHA.indexOf(ch), steps: 0 };
    });
    const run = (onDone, opts = {}) => {
      const interval = opts.interval || 55; const stagger = opts.stagger || 70;
      cells.forEach((c, i) => {
        c.el.classList.remove('is-on');
        c.cur = Math.floor(Math.random() * ALPHA.length);
        c.steps = 6 + i * 2 + Math.floor(Math.random() * 6);
        c.el.textContent = ALPHA[c.cur];
        c.started = performance.now() + i * stagger;
        c.done = false;
      });
      let last = 0; let doneCount = 0;
      const loop = (now) => {
        if (now - last >= interval) {
          last = now;
          cells.forEach((c) => {
            if (c.done || now < c.started) return;
            if (c.steps > 0) { c.cur = (c.cur + 1) % ALPHA.length; c.steps--; }
            else { c.cur = c.target; }
            c.el.textContent = ALPHA[c.cur];
            c.el.classList.remove('is-tick'); void c.el.offsetWidth; c.el.classList.add('is-tick');
            if (c.steps === 0 && c.cur === c.target) { c.done = true; c.el.classList.add('is-on'); doneCount++; }
          });
        }
        if (doneCount < cells.length) requestAnimationFrame(loop); else onDone && onDone();
      };
      requestAnimationFrame(loop);
    };
    const settle = () => cells.forEach((c) => { c.el.textContent = ALPHA[c.target]; c.el.classList.add('is-on'); });
    return { run, settle, el };
  }

  /* =========================================================================
     ByteField — flip-dot particle field (hero) / byte stream (cta)
     ========================================================================= */
  class ByteField {
    constructor(canvas, opts) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ mode: 'word', word: 'RUNBYTE', yCenter: 0.42 }, opts);
      this.p = 0; this.mouse = { x: -9999, y: -9999 }; this.time = 0; this.running = false; this.alpha = 1;
      this.particles = []; this.grid = []; this.cols = [];
      this.resize = this.resize.bind(this); this.frame = this.frame.bind(this);
      window.addEventListener('resize', this.resize);
      if (fine) {
        window.addEventListener('mousemove', (e) => { const r = this.c.getBoundingClientRect(); this.mouse.x = (e.clientX - r.left); this.mouse.y = (e.clientY - r.top); });
        window.addEventListener('mouseleave', () => { this.mouse.x = -9999; });
      }
      this.resize();
    }
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = this.c.getBoundingClientRect();
      this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
      this.c.width = this.w * dpr; this.c.height = this.h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.s = Math.max(9, Math.min(17, this.w / 88));
      this.build();
    }
    build() {
      const s = this.s; const cols = Math.ceil(this.w / s) + 1; const rows = Math.ceil(this.h / s) + 1;
      this.grid = { cols, rows };
      if (this.o.mode === 'stream') {
        this.cols = Array.from({ length: cols }, (_, i) => ({ x: i * s, y: Math.random() * rows, speed: 2 + Math.random() * 6, len: 4 + Math.random() * 14, on: Math.random() > 0.55 }));
        return;
      }
      // sample the wordmark
      const off = document.createElement('canvas'); off.width = cols; off.height = rows;
      const octx = off.getContext('2d');
      octx.fillStyle = '#fff'; octx.textBaseline = 'middle'; octx.textAlign = 'center';
      const lines = this.w < 700 ? ['RUN', 'BYTE'] : [this.o.word];
      const setFont = (px) => { octx.font = `800 ${px}px Archivo, Arial, sans-serif`; try { octx.fontStretch = 'expanded'; } catch (e) {} };
      const target = cols * 0.9;
      let fs = 100; setFont(fs);
      const widest = Math.max(...lines.map((l) => octx.measureText(l).width));
      fs = fs * (target / widest); setFont(fs);
      const lh = fs * 0.86; const cy = rows * this.o.yCenter;
      lines.forEach((l, i) => octx.fillText(l, cols / 2, cy + (i - (lines.length - 1) / 2) * lh));
      const data = octx.getImageData(0, 0, cols, rows).data;
      const prev = this.particles; this.particles = [];
      let k = 0;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (data[(y * cols + x) * 4 + 3] > 110) {
          const old = prev[k++];
          this.particles.push({
            tx: x * s, ty: y * s,
            sx: Math.random() * this.w, sy: -this.h * (0.2 + Math.random() * 1.2),
            d: Math.random() * 0.45, x: old ? old.x : 0, y: old ? old.y : 0, flick: 0
          });
        }
      }
    }
    start() { if (this.running) return; this.running = true; gsap.ticker.add(this.frame); }
    stop() { this.running = false; gsap.ticker.remove(this.frame); }
    frame(_, dt) {
      this.time += dt / 1000;
      const ctx = this.ctx; ctx.clearRect(0, 0, this.w, this.h);
      if (this.o.mode === 'stream') return this.drawStream();
      const s = this.s; const t = this.time;
      // background dot grid
      ctx.fillStyle = 'rgba(242,241,236,0.06)';
      for (let y = 0; y < this.grid.rows; y++) for (let x = 0; x < this.grid.cols; x++) ctx.fillRect(x * s - 0.75, y * s - 0.75, 1.5, 1.5);
      // particles
      const R = s * 7; const R2 = R * R;
      const p = this.p;
      for (const q of this.particles) {
        const e = Math.min(1, Math.max(0, (p - q.d) / (1 - q.d)));
        const ee = 1 - Math.pow(1 - e, 4);
        let x = q.sx + (q.tx - q.sx) * ee; let y = q.sy + (q.ty - q.sy) * ee;
        const dx = x - this.mouse.x; const dy = y - this.mouse.y; const d2 = dx * dx + dy * dy;
        if (d2 < R2) { const d = Math.sqrt(d2) || 1; const f = (1 - d / R) * s * 3; x += dx / d * f; y += dy / d * f; }
        q.x += (x - q.x) * 0.18; q.y += (y - q.y) * 0.18;
        // wave sweep + flicker
        const wave = Math.sin(q.tx * 0.012 - t * 2.2) * 0.5 + 0.5;
        if (q.flick > 0) q.flick -= dt; else if (Math.random() < 0.0008) q.flick = 120 + Math.random() * 200;
        const on = q.flick <= 0;
        const r = s * (0.22 + 0.16 * wave) * (0.4 + 0.6 * ee);
        ctx.fillStyle = on ? YELLOW : 'rgba(242,241,236,0.18)';
        ctx.globalAlpha = this.alpha * (0.55 + 0.45 * wave);
        ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawStream() {
      const ctx = this.ctx; const s = this.s;
      for (const col of this.cols) {
        col.y += col.speed * 0.02;
        if (col.y - col.len > this.grid.rows) { col.y = -Math.random() * 20; col.speed = 2 + Math.random() * 6; col.on = Math.random() > 0.55; }
        for (let i = 0; i < col.len; i++) {
          const yy = Math.floor(col.y) - i; if (yy < 0 || yy > this.grid.rows) continue;
          const a = (1 - i / col.len) * 0.5 * this.alpha;
          ctx.fillStyle = col.on && i === 0 ? YELLOW : FG;
          ctx.globalAlpha = i === 0 ? a * 1.6 : a * 0.35;
          ctx.beginPath(); ctx.arc(col.x, yy * s, s * 0.2, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  const heroCanvas = $('#byteField');
  const field = heroCanvas ? new ByteField(heroCanvas, { mode: 'word', word: 'RUNBYTE', yCenter: window.innerWidth < 700 ? 0.36 : 0.4 }) : null;
  const ctaCanvas = $('#byteStream');
  const stream = ctaCanvas ? new ByteField(ctaCanvas, { mode: 'stream' }) : null;
  if (field) {
    ScrollTrigger.create({ trigger: '#hero', start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? field.start() : field.stop()) });
    if (!reduce) gsap.to(field, { alpha: 0.12, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  if (stream) {
    ScrollTrigger.create({ trigger: '#contact', start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive && !reduce ? stream.start() : stream.stop()) });
    if (reduce) { stream.frame(0, 16); }
  }

  /* =========================================================================
     Text effects
     ========================================================================= */
  const splits = new Map();
  $$('[data-split]').forEach((el) => {
    const inHero = el.closest('.hero') !== null;
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit(self) {
        if (reduce) return;
        const tw = gsap.from(self.lines, { yPercent: 110, duration: 1.3, stagger: 0.08, ease: 'out', paused: inHero, scrollTrigger: inHero ? null : { trigger: el, start: 'top 85%', once: true } });
        if (inHero) splits.set(el, tw);
        return tw;
      }
    });
  });
  $$('[data-fill]').forEach((el) => {
    SplitText.create(el, { type: 'words', wordsClass: 'word', autoSplit: true,
      onSplit(self) {
        if (reduce) { self.words.forEach((w) => (w.style.opacity = 1)); return; }
        return gsap.to(self.words, { opacity: 1, stagger: 0.04, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 50%', scrub: 0.5 } });
      }
    });
  });
  if (!reduce) {
    ScrollTrigger.batch('[data-reveal]:not(.hero [data-reveal])', { start: 'top 88%', once: true, onEnter: (b) => b.forEach((el, i) => setTimeout(() => el.classList.add('is-in'), i * 80)) });
  } else $$('[data-reveal]').forEach((el) => el.classList.add('is-in'));

  // Scramble on hover
  if (fine && !reduce) {
    $$('[data-scramble]').forEach((el) => {
      const text = el.dataset.scramble || el.textContent;
      const target = el.closest('a, button, .rule') || el;
      let tw;
      target.addEventListener('mouseenter', () => {
        if (tw) tw.kill();
        tw = gsap.to(el, { duration: 0.7, scrambleText: { text, chars: '01', speed: 0.6, tweenLength: false } });
      });
    });
  }

  /* =========================================================================
     Services: sticky index + SVG visuals
     ========================================================================= */
  const indexItems = $$('#serviceIndex li');
  $$('.panel').forEach((panel) => {
    const i = +panel.dataset.index;
    ScrollTrigger.create({
      trigger: panel, start: 'top 55%', end: 'bottom 55%',
      onToggle: (st) => { if (st.isActive) indexItems.forEach((li, k) => li.classList.toggle('is-active', k === i)); }
    });
  });

  // grid viz
  const gridG = $('.viz--grid .viz__grid');
  if (gridG) {
    let s = '';
    for (let x = 0; x <= 400; x += 20) s += `<line x1="${x}" y1="0" x2="${x}" y2="240"/>`;
    for (let y = 0; y <= 240; y += 20) s += `<line x1="0" y1="${y}" x2="400" y2="${y}"/>`;
    gridG.innerHTML = s;
  }
  // wave viz
  const wave1 = $('.viz--wave .viz__wave:not(.viz__wave--2)'); const wave2 = $('.viz--wave .viz__wave--2');
  const wavePath = (t, amp, f, ph) => { let d = ''; for (let x = 0; x <= 400; x += 4) { const y = 120 + Math.sin(x * f + t + ph) * amp * Math.sin(x * 0.008 + t * 0.3); d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1); } return d; };
  let waveT = 0; const waveTick = (_, dt) => { waveT += dt / 1000; wave1.setAttribute('d', wavePath(waveT * 2, 40, 0.05, 0)); wave2.setAttribute('d', wavePath(waveT * 1.4, 26, 0.035, 1.3)); };
  if (wave1) { if (reduce) waveTick(0, 16); else ScrollTrigger.create({ trigger: '#svc-ai', start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? gsap.ticker.add(waveTick) : gsap.ticker.remove(waveTick)) }); }
  // nodes viz
  const nodesG = $('.viz--nodes .viz__nodes'); const linksG = $('.viz--nodes .viz__links');
  if (nodesG) {
    const pts = [[200, 120, 1], [90, 60, 0], [310, 60, 0], [70, 170, 0], [330, 180, 0], [200, 30, 0], [200, 210, 0], [140, 120, 0], [260, 120, 0]];
    linksG.innerHTML = pts.slice(1).map((p) => `<line x1="200" y1="120" x2="${p[0]}" y2="${p[1]}"/>`).join('') + `<line x1="90" y1="60" x2="200" y2="30"/><line x1="310" y1="60" x2="200" y2="30"/><line x1="70" y1="170" x2="200" y2="210"/><line x1="330" y1="180" x2="200" y2="210"/>`;
    nodesG.innerHTML = pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2] ? 9 : 6}" class="${p[2] ? 'hub' : ''}"/>`).join('');
    if (!reduce) gsap.to('.viz--nodes .viz__nodes circle:not(.hub)', { attr: { r: 4 }, duration: 1.2, stagger: { each: 0.15, repeat: -1, yoyo: true }, ease: 'sine.inOut' });
  }
  // signal + cursor viz
  if (!reduce) {
    gsap.fromTo('.viz__signal circle', { scale: 0.6, opacity: 0.5, transformOrigin: '300px 120px' }, { scale: 1.15, opacity: 0, duration: 2.4, stagger: 0.8, repeat: -1, ease: 'sine.out' });
    gsap.timeline({ repeat: -1, repeatDelay: 1 })
      .fromTo('.viz__cursor', { x: 60, y: 60 }, { x: 150, y: 160, duration: 1.2, ease: 'power2.inOut' })
      .to('.viz__cursor', { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: '0 0' })
      .to('.viz__accent', { attr: { width: 90 }, duration: 0.5, ease: 'out' }, '<')
      .to('.viz__cursor', { x: 250, y: 90, duration: 1.2, ease: 'power2.inOut' }, '+=0.4')
      .to('.viz__accent', { attr: { width: 60 }, duration: 0.5 }, '<');
  }

  /* =========================================================================
     Process: horizontal runtime
     ========================================================================= */
  const mm = gsap.matchMedia();
  const stages = $$('.stage');
  const stageNum = $('#stageNum'); const stageName = $('#stageName');
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const pin = $('#processPin'); const track = $('#processTrack'); const line = $('#processLine');
    if (!pin || !track) return;
    const getDist = () => {
      const pad = parseFloat(getComputedStyle(pin).paddingLeft) || 0;
      return Math.max(0, track.scrollWidth - window.innerWidth + pad * 2);
    };
    gsap.to(track, {
      x: () => -getDist(), ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true, scrub: 0.6, start: 'top 22%', end: () => '+=' + (getDist() + 200), invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (st) => {
          gsap.set(line, { scaleX: st.progress });
          const i = Math.min(stages.length - 1, Math.floor(st.progress * stages.length + 0.0001));
          if (stageNum.textContent !== String(i + 1).padStart(2, '0')) { stageNum.textContent = String(i + 1).padStart(2, '0'); stageName.textContent = stages[i].dataset.name; }
        }
      }
    });
  });

  /* ---------- FAQ ---------- */
  $$('.faq__item').forEach((d) => {
    const summary = $('summary', d); const body = $('.faq__body', d);
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (reduce) { d.open = !d.open; return; }
      if (d.open) gsap.to(body, { height: 0, opacity: 0, duration: 0.4, ease: 'inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'all' }); } });
      else { d.open = true; gsap.from(body, { height: 0, opacity: 0, duration: 0.55, ease: 'inOut', onComplete: () => { gsap.set(body, { clearProps: 'all' }); ScrollTrigger.refresh(); } }); }
    });
  });

  /* ---------- Nav ---------- */
  const nav = $('#nav'); let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { const y = self.scroll(); nav.classList.toggle('is-scrolled', y > 20); if (y > 120 && y > lastY + 4 && !menuOpen) nav.classList.add('is-hidden'); else if (y < lastY - 4 || y < 120) nav.classList.remove('is-hidden'); lastY = y; } });
  // light sections: flip the nav palette while they sit under it
  ScrollTrigger.create({ trigger: '#stack', endTrigger: '#faq', start: 'top 34px', end: 'bottom 34px', onToggle: (st) => nav.classList.toggle('is-light', st.isActive) });

  /* ---------- Menu ---------- */
  const menu = $('#menu'); const burger = $('#burger'); let menuOpen = false;
  const menuLinks = $$('.menu__links a', menu);
  const openMenu = () => {
    menuOpen = true; burger.setAttribute('aria-expanded', 'true'); burger.querySelector('span').textContent = 'Close';
    menu.setAttribute('aria-hidden', 'false'); nav.classList.remove('is-hidden'); lenis?.stop();
    gsap.set(menu, { visibility: 'visible' });
    gsap.timeline().to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'inOut' }).from(menuLinks, { yPercent: 60, opacity: 0, stagger: 0.05, duration: 0.7 }, '-=0.35');
  };
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; burger.setAttribute('aria-expanded', 'false'); burger.querySelector('span').textContent = 'Menu';
    menu.setAttribute('aria-hidden', 'true'); lenis?.start();
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
  }
  burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && fine && !reduce) {
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3' }); const cy = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); cursor.classList.remove('is-hidden'); });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    const hov = 'a, button, summary, .rule, .datasheet tr';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(hov)) cursor.classList.add('is-link'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(hov)) cursor.classList.remove('is-link'); });
  }

  /* =========================================================================
     Loader + intro
     ========================================================================= */
  const loader = $('#loader');
  const board = $('#flapBoard') ? createFlapBoard($('#flapBoard'), $('#flapBoard').dataset.word) : null;
  const footerBoard = $('#footerFlap') ? createFlapBoard($('#footerFlap'), $('#footerFlap').dataset.word) : null;
  if (footerBoard) {
    if (reduce) footerBoard.settle();
    else {
      ScrollTrigger.create({ trigger: '.footer__flap', start: 'top 90%', once: true, onEnter: () => footerBoard.run() });
      if (fine) footerBoard.el.addEventListener('mouseenter', () => footerBoard.run(null, { interval: 45, stagger: 40 }));
    }
  }

  const intro = () => {
    document.body.classList.remove('is-loading'); lenis?.start();
    nav.classList.remove('is-pre');
    if (field) { field.start(); gsap.to(field, { p: 1, duration: 2.2, ease: 'power2.inOut' }); }
    const tl = gsap.timeline({ delay: 0.35 });
    splits.forEach((tw) => tl.add(tw.play(), 0));
    tl.add(() => $$('.hero [data-reveal]').forEach((el, i) => setTimeout(() => el.classList.add('is-in'), i * 120)), 0.3);
    tl.from('.hero__corner', { opacity: 0, y: 6, stagger: 0.08, duration: 0.8 }, 0.2);
    ScrollTrigger.refresh();
  };

  const ready = document.fonts ? document.fonts.load('800 100px Archivo').catch(() => {}) : Promise.resolve();

  if (loader && !reduce) {
    lenis?.stop();
    const seen = sessionStorage.getItem('rb2-loaded');
    const pct = $('#loaderPct'); const status = $('#loaderStatus');
    const words = ['BOOT', 'LOAD FONTS', 'SAMPLE GRID', 'MOUNT', 'RUN'];
    const obj = { v: 0 }; const dur = seen ? 1.0 : 2.0;
    gsap.to(obj, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: () => { pct.textContent = String(Math.round(obj.v)).padStart(3, '0'); status.textContent = words[Math.min(words.length - 1, Math.floor(obj.v / 100 * words.length))]; } });
    let flapDone = false; let fontsDone = false; let started = false;
    const finish = () => {
      if (started || !flapDone || !fontsDone) return; started = true;
      sessionStorage.setItem('rb2-loaded', '1');
      field && field.build();
      gsap.timeline()
        .to('.loader__board, .loader__status', { opacity: 0, duration: 0.35, delay: 0.25 })
        .to(loader, { yPercent: -100, duration: 0.9, ease: 'inOut' }, '-=0.1')
        .add(intro, '-=0.6')
        .set(loader, { display: 'none' });
    };
    board.run(() => { flapDone = true; finish(); }, { interval: seen ? 40 : 55, stagger: seen ? 40 : 80 });
    ready.then(() => { fontsDone = true; finish(); });
  } else {
    if (loader) loader.style.display = 'none';
    board && board.settle();
    ready.then(() => {
      document.body.classList.remove('is-loading'); nav.classList.remove('is-pre');
      if (field) { field.build(); field.p = 1; field.start(); if (reduce) { field.frame(0, 16); field.stop(); } }
      splits.forEach((tw) => tw.progress(1));
      $$('.hero [data-reveal]').forEach((el) => el.classList.add('is-in'));
      ScrollTrigger.refresh();
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
