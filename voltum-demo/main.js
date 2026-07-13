/* VOLTUM Elektrotechnik: Motion & Interaktion
   GSAP + ScrollTrigger via CDN. Kein window.addEventListener('scroll').
   prefers-reduced-motion wird ueberall respektiert. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Mobile Navigation
     --------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-nav');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Aktiver Nav-Link nach aktueller Seite
     --------------------------------------------------------------------- */
  function initActiveLink() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------------------------------------------------------------------
     Marquee: Inhalt einmal klonen fuer nahtlose Schleife
     --------------------------------------------------------------------- */
  function initMarquee() {
    document.querySelectorAll('.marquee-track').forEach(function (track) {
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
      track.parentNode.style.display = 'flex';
    });
  }

  /* ---------------------------------------------------------------------
     FAQ Akkordeon
     --------------------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var trigger = item.querySelector('.faq-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        var isOpen = item.getAttribute('data-open') === 'true';
        item.closest('.faq-list').querySelectorAll('.faq-item').forEach(function (other) {
          if (other !== item) other.setAttribute('data-open', 'false');
        });
        item.setAttribute('data-open', String(!isOpen));
      });
    });
  }

  /* ---------------------------------------------------------------------
     Referenzen-Filter
     --------------------------------------------------------------------- */
  function initFilter() {
    var bar = document.querySelector('.filter-bar');
    if (!bar) return;
    var buttons = bar.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('[data-category]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        var cat = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var match = cat === 'alle' || card.getAttribute('data-category') === cat;
          card.hidden = !match;
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Bewertungs-Slider Steuerung
     --------------------------------------------------------------------- */
  function initReviewSlider() {
    var slider = document.querySelector('.review-slider');
    var controls = document.querySelector('.review-controls');
    if (!slider || !controls) return;
    var prev = controls.querySelector('[data-dir="prev"]');
    var next = controls.querySelector('[data-dir="next"]');
    var step = function () {
      var card = slider.querySelector('.review-card');
      return card ? card.getBoundingClientRect().width + 24 : 340;
    };
    if (next) next.addEventListener('click', function () { slider.scrollBy({ left: step(), behavior: 'smooth' }); });
    if (prev) prev.addEventListener('click', function () { slider.scrollBy({ left: -step(), behavior: 'smooth' }); });
  }

  /* ---------------------------------------------------------------------
     Scroll-Reveal (IntersectionObserver, kein scroll-Listener)
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Count-Up (ueber-uns Zahlen)
     --------------------------------------------------------------------- */
  function initCountUp() {
    var items = document.querySelectorAll('[data-count-to]');
    if (!items.length) return;

    function animateCount(el) {
      var to = parseFloat(el.getAttribute('data-count-to'));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = el.getAttribute('data-count-decimals') ? parseInt(el.getAttribute('data-count-decimals'), 10) : 0;
      if (reduceMotion) {
        el.textContent = to.toFixed(decimals) + suffix;
        return;
      }
      var start = 0;
      var duration = 1600;
      var startTime = null;
      function tick(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = start + (to - start) * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      items.forEach(animateCount);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     GSAP: Hero-Entrance + Scroll-Choreografie
     --------------------------------------------------------------------- */
  function initGsap() {
    if (typeof gsap === 'undefined') return;

    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    if (reduceMotion) return;

    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (document.querySelector('.hero-strip')) {
      heroTl
        .from('.hero-strip', { opacity: 0, y: 12, duration: 0.6 })
        .from('.hero h1', { opacity: 0, y: 24, duration: 0.8 }, '-=0.35')
        .from('.hero .body-lg', { opacity: 0, y: 18, duration: 0.7 }, '-=0.5')
        .from('.hero-ctas .btn', { opacity: 0, y: 14, duration: 0.6, stagger: 0.1 }, '-=0.45')
        .from('.hero-visual', { opacity: 0, scale: 0.92, duration: 0.9 }, '-=0.6');
    } else if (document.querySelector('.page-hero .h1')) {
      heroTl
        .from('.page-hero .eyebrow', { opacity: 0, y: 12, duration: 0.5 })
        .from('.page-hero .h1', { opacity: 0, y: 22, duration: 0.7 }, '-=0.3')
        .from('.page-hero .body-lg', { opacity: 0, y: 16, duration: 0.6 }, '-=0.4');
    }

    if (!window.ScrollTrigger) return;

    /* Bento-Karten: sanftes Stagger-Reveal */
    var bentoCards = gsap.utils.toArray('.bento-card');
    if (bentoCards.length) {
      gsap.from(bentoCards, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.bento', start: 'top 80%' }
      });
    }

    /* Prozess: jeder Schritt (ausser dem letzten) pinnt einzeln fuer eine
       Bildschirmhoehe und blendet dabei aus, dann uebernimmt der naechste
       im normalen Fluss. Der letzte Schritt bleibt ungepinnt, damit nichts
       als Fixed-Element in die naechste Sektion hineinragt. */
    var steps = gsap.utils.toArray('.process-step');
    if (steps.length > 1) {
      steps.forEach(function (step, i) {
        if (i === steps.length - 1) return;
        ScrollTrigger.create({
          trigger: step,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: true
        });
        gsap.to(step.querySelector('.process-step-inner'), {
          opacity: 0.2,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: step,
            start: 'top top',
            end: '+=100%',
            scrub: true
          }
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
     Header: Hintergrund verstaerken nach dem Scrollen ueber den Hero
     Nutzt IntersectionObserver mit Sentinel statt scroll-Listener.
     --------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
     Demo-Badge ausblenden, sobald der Footer-Credit ohnehin sichtbar ist
     (verhindert doppelten Kaiserstuhl-Digital-Hinweis in derselben Ecke)
     --------------------------------------------------------------------- */
  function initBadgeVisibility() {
    var badge = document.querySelector('.kd-badge');
    var footerCredit = document.querySelector('.footer-credit');
    if (!badge || !footerCredit || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        badge.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { threshold: 0 });
    io.observe(footerCredit);
  }

  function initHeaderState() {
    var header = document.querySelector('.site-header');
    var sentinel = document.querySelector('.scroll-sentinel');
    if (!header || !sentinel || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        header.classList.toggle('is-scrolled', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    io.observe(sentinel);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initActiveLink();
    initMarquee();
    initFaq();
    initFilter();
    initReviewSlider();
    initReveal();
    initCountUp();
    initHeaderState();
    initBadgeVisibility();
    initGsap();
  });
})();
