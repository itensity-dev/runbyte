(() => {
  'use strict';
  const KEY = 'rb-consent';
  const VERSION = 1;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && v.v === VERSION ? v : null; } catch (e) { return null; } };
  const write = (analytics) => {
    const v = { v: VERSION, analytics: !!analytics, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    return v;
  };
  const emit = (state) => document.dispatchEvent(new CustomEvent('rb:consent', { detail: state }));

  window.runbyteConsent = {
    get: () => read(),
    allows: (category) => category === 'necessary' || !!(read() || {})[category],
    open: () => show(true)
  };

  let el = null;
  const build = () => {
    el = document.createElement('section');
    el.className = 'consent';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie notice');
    el.hidden = true;
    el.innerHTML = '<div class="consent__head"><span class="consent__dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>Cookies</div>' +
      '<p>We use only what this site needs to run: no ads, no tracking. If we add optional analytics, they stay off until you accept. <a href="/privacy/#cookies">Privacy policy</a></p>' +
      '<div class="consent__actions"><button type="button" class="consent__btn" data-choice="necessary">Only necessary</button><button type="button" class="consent__btn consent__btn--primary" data-choice="all">Accept</button></div>';
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-choice]'); if (!b) return;
      emit(write(b.dataset.choice === 'all'));
      hide();
    });
    document.body.appendChild(el);
  };
  const show = (focus) => {
    if (!el) build();
    el.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
    if (focus) el.querySelector('.consent__btn--primary').focus({ preventScroll: true });
  };
  const hide = () => { if (!el) return; el.classList.remove('is-in'); setTimeout(() => { el.hidden = true; }, 450); };

  const whenReady = (fn) => {
    const ready = () => !document.body.classList.contains('is-loading') || !document.documentElement.classList.contains('js');
    if (ready()) return fn();
    const t = setInterval(() => { if (ready()) { clearInterval(t); setTimeout(fn, 900); } }, 200);
  };

  const init = () => {
    if (document.querySelector('.cursor')) document.body.classList.add('has-cursor');
    document.querySelectorAll('[data-consent-open]').forEach((b) => b.addEventListener('click', () => show(true)));
    const state = read();
    if (state) emit(state); else whenReady(() => show(false));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
