(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro / loader ---------- */
  function ready() { root.classList.add('is-ready'); }
  var minDelay = reduceMotion ? 0 : 1500;
  var start = Date.now();
  function onLoaded() { setTimeout(ready, Math.max(0, minDelay - (Date.now() - start))); }
  if (document.readyState === 'complete') onLoaded();
  else window.addEventListener('load', onLoaded);

  /* ---------- Header: solid na de hero, verbergen bij omlaag scrollen ---------- */
  var header = document.querySelector('[data-header]');
  var lastY = window.scrollY;
  function updateHeader() {
    var y = window.scrollY;
    header.classList.toggle('is-solid', y > 60);
    if (!root.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > 700);
    }
    lastY = y;
  }

  /* ---------- Mobiel menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    if (open) header.classList.remove('is-hidden');
  }
  menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 760 && root.classList.contains('menu-open')) setMenu(false); });

  /* ---------- Soepel scrollen naar ankers (rekening houdend met header) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Reveal bij scrollen ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Tellers ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var from = end > 1000 ? end - 140 : 0;
    var t0 = null, dur = 1800;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(from + (end - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Statement: woorden lichten op tijdens scrollen ---------- */
  var statement = document.querySelector('[data-words]');
  var words = [];
  if (statement && !reduceMotion) {
    var text = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    text.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      statement.appendChild(span);
      if (i < text.length - 1) statement.appendChild(document.createTextNode(' '));
      words.push(span);
    });
  }
  function updateWords() {
    if (!words.length) return;
    var rect = statement.getBoundingClientRect();
    var vh = window.innerHeight;
    var progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
    progress = Math.max(0, Math.min(1, progress));
    var lit = Math.round(progress * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
  }

  /* ---------- Parallax ---------- */
  var parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  function updateParallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    parallax.forEach(function (img) {
      var frame = img.parentElement;
      var r = frame.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var speed = parseFloat(img.getAttribute('data-parallax')) || 0.08;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;
      var limit = r.height * 0.075;
      offset = Math.max(-limit, Math.min(limit, offset));
      img.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
  }

  /* ---------- Scroll-lus ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHeader();
      updateWords();
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menukaart-tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- Groepen-knop kiest 'Groep' in het formulier ---------- */
  var groupLink = document.querySelector('[data-group-link]');
  var persSelect = document.getElementById('f-pers');
  if (groupLink && persSelect) {
    groupLink.addEventListener('click', function () { persSelect.value = 'Groep (9+)'; });
  }

  /* ---------- Formulier (preview: verstuurt niets) ---------- */
  var form = document.querySelector('.form');
  if (form) {
    var errorEl = form.querySelector('.form-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = form.querySelector('#f-naam');
      var email = form.querySelector('#f-email');
      var okNaam = naam.value.trim().length > 1;
      var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      naam.parentElement.classList.toggle('invalid', !okNaam);
      email.parentElement.classList.toggle('invalid', !okMail);
      if (!okNaam || !okMail) {
        errorEl.hidden = false;
        (okNaam ? email : naam).focus();
        return;
      }
      errorEl.hidden = true;
      form.querySelector('.form-body').hidden = true;
      form.querySelector('.form-done').hidden = false;
    });
  }
})();
