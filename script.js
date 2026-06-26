/* ============================================================
   ÉTHÉRÉ — interactions
   Loader · cursor · particles · reveals · parallax ·
   cabinet drag · notes · timeline · fragrance finder
   ============================================================ */
(function () {
  'use strict';
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const lerp = (a, b, n) => a + (b - a) * n;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ============================================================
     LOADER
     ============================================================ */
  (function loader () {
    const el = $('#loader'), count = $('#loaderCount');
    if (!el) return;
    let n = 0;
    const tick = setInterval(() => {
      n = Math.min(100, n + Math.floor(Math.random() * 13) + 4);
      if (count) count.textContent = String(n).padStart(2, '0');
      if (n >= 100) {
        clearInterval(tick);
        setTimeout(() => {
          el.classList.add('is-done');
          document.body.classList.add('is-ready');
          revealInView();
        }, 380);
      }
    }, 130);
  })();

  /* ============================================================
     CUSTOM CURSOR (+ magnetic)
     ============================================================ */
  (function cursor () {
    const ring = $('#cursor'), dot = $('#cursorDot');
    if (!ring || window.matchMedia('(hover:none)').matches) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function raf () {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    })();

    const hover = () => ring.classList.add('is-hover');
    const unhover = () => ring.classList.remove('is-hover');
    const bind = () => $$('[data-cursor], a, button').forEach(el => {
      if (el.dataset.bound) return; el.dataset.bound = '1';
      el.addEventListener('mouseenter', hover);
      el.addEventListener('mouseleave', unhover);
    });
    bind();

    /* magnetic buttons */
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  })();

  /* ============================================================
     FLOATING PARTICLES
     ============================================================ */
  (function particles () {
    const canvas = $('#particles');
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    let w, h, pts = [];
    const COUNT = Math.min(70, Math.floor(innerWidth / 22));

    function size () {
      w = canvas.width = innerWidth * devicePixelRatio;
      h = canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }
    function seed () {
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.3) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
        vy: (-Math.random() * 0.28 - 0.05) * devicePixelRatio,
        a: Math.random() * 0.5 + 0.1, tw: Math.random() * 0.02 + 0.005, t: Math.random() * 6
      }));
    }
    function frame () {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.t += p.tw;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const a = p.a * (0.6 + 0.4 * Math.sin(p.t));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216,184,134,${a})`;
        ctx.shadowBlur = 8 * devicePixelRatio; ctx.shadowColor = 'rgba(231,200,145,.6)';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size(); seed(); frame();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); seed(); }, 200); });
  })();

  /* ============================================================
     NAV state + mobile menu
     ============================================================ */
  (function nav () {
    const nav = $('#nav'), burger = $('#burger'), menu = $('#mobileMenu');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }, { passive: true });
    if (burger) {
      const toggle = () => {
        burger.classList.toggle('is-open');
        menu.classList.toggle('is-open');
        document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
      };
      burger.addEventListener('click', toggle);
      $$('a', menu).forEach(a => a.addEventListener('click', () => {
        burger.classList.remove('is-open'); menu.classList.remove('is-open'); document.body.style.overflow = '';
      }));
    }
  })();

  /* ============================================================
     REVEAL on scroll + counters
     ============================================================ */
  let revealInView;
  (function reveals () {
    const items = $$('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
    revealInView = () => items.forEach(i => {
      const r = i.getBoundingClientRect();
      if (r.top < innerHeight * 0.92) i.classList.add('is-in');
    });

    /* counters */
    const counters = $$('[data-count]');
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count;
        let cur = 0; const dur = 1500, t0 = performance.now();
        const run = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target).toLocaleString();
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  })();

  /* ============================================================
     HERO parallax — bottle drifts up, atmosphere deepens
     ============================================================ */
  (function heroParallax () {
    const hero = $('#hero'), bottle = $('#heroBottle');
    if (!hero || !bottle || reduce) return;
    let cur = 0, target = 0;
    window.addEventListener('scroll', () => {
      const p = Math.min(1, window.scrollY / innerHeight);
      target = p;
    }, { passive: true });
    (function raf () {
      cur = lerp(cur, target, 0.08);
      const y = -cur * innerHeight * 0.55;
      const s = 1 - cur * 0.18;
      const o = 1 - cur * 1.1;
      bottle.style.transform = `translate(-50%,-50%) translateY(${y}px) scale(${s})`;
      bottle.style.opacity = Math.max(0, o);
      requestAnimationFrame(raf);
    })();
  })();

  /* ============================================================
     CABINET — drag / wheel horizontal scroll
     ============================================================ */
  (function cabinet () {
    const rail = $('#cabinetRail');
    if (!rail) return;
    let down = false, startX = 0, startScroll = 0, vx = 0, last = 0;

    const onDown = (x) => { down = true; startX = x; startScroll = rail.scrollLeft; last = x; rail.classList.add('is-grabbing'); };
    const onMove = (x) => { if (!down) return; const d = x - startX; rail.scrollLeft = startScroll - d; vx = x - last; last = x; };
    const onUp = () => {
      if (!down) return; down = false; rail.classList.remove('is-grabbing');
      let v = vx; (function glide () { if (Math.abs(v) < 0.4) return; rail.scrollLeft -= v; v *= 0.94; requestAnimationFrame(glide); })();
    };

    rail.addEventListener('mousedown', e => { e.preventDefault(); onDown(e.pageX); });
    window.addEventListener('mousemove', e => onMove(e.pageX));
    window.addEventListener('mouseup', onUp);
    rail.addEventListener('touchstart', e => onDown(e.touches[0].pageX), { passive: true });
    rail.addEventListener('touchmove', e => onMove(e.touches[0].pageX), { passive: true });
    rail.addEventListener('touchend', onUp);
    rail.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { rail.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
  })();

  /* ============================================================
     NOTES — tap to expand (hover handled in CSS)
     ============================================================ */
  (function notes () {
    $$('#notesGrid .note').forEach(n => {
      n.addEventListener('click', () => n.classList.toggle('is-open'));
    });
  })();

  /* ============================================================
     COMMISSIONS — timeline fill + active nodes
     ============================================================ */
  (function timeline () {
    const line = $('#timelineFill'), steps = $$('.step');
    if (!line) return;
    const list = $('.timeline');
    window.addEventListener('scroll', () => {
      const r = list.getBoundingClientRect();
      const total = r.height;
      const passed = Math.min(total, Math.max(0, innerHeight * 0.55 - r.top));
      line.style.height = (passed / total * 100) + '%';
      const mid = innerHeight * 0.55;
      steps.forEach(s => {
        const sr = s.getBoundingClientRect();
        s.classList.toggle('is-in', sr.top < mid && sr.bottom > mid * 0.5);
      });
    }, { passive: true });
  })();

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  (function progress () {
    const bar = $('#scrollBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
  })();

  /* ============================================================
     FRAGRANCE FINDER — interactive quiz
     ============================================================ */
  (function finder () {
    const stage = $('#quizStage'), fill = $('#quizFill'), result = $('#quizResult');
    if (!stage) return;

    const FAMILIES = {
      floral:   { name: 'Floral',   line: 'A room left full of cut stems and rain.',            pick: 'Sève' },
      marine:   { name: 'Marine',   line: 'Storm clouds gathering over a distant coastline.',   pick: 'Nacre' },
      wood:     { name: 'Wood',     line: 'A quiet cedar cabin in the hour after rain.',         pick: 'Nacre' },
      amber:    { name: 'Amber',    line: 'Golden light falling through heavy curtains.',         pick: 'Velours' },
      oriental: { name: 'Oriental', line: 'Smoke, resin and gold in a low-lit hall.',            pick: 'Brûle' },
      citrus:   { name: 'Citrus',   line: 'First light breaking clean across cold water.',       pick: 'Verre' }
    };

    const QS = [
      { q: 'Which place feels most like home?', a: [
        { t: 'A moonlit garden',    s: 'Where the air is cool and green', f: 'floral' },
        { t: 'A coastal cliff',     s: 'Wind, salt and open distance',    f: 'marine' },
        { t: 'A hidden library',    s: 'Leather, paper and old wood',     f: 'wood' },
        { t: 'A candlelit lounge',  s: 'Low gold light and warmth',        f: 'amber' },
        { t: 'A forest after rain', s: 'Wet earth and tall cedar',         f: 'wood' } ] },
      { q: 'Choose a light.', a: [
        { t: 'First sun at dawn',   s: 'Clean and rising',  f: 'citrus' },
        { t: 'Amber lamplight',     s: 'Slow and warm',     f: 'amber' },
        { t: 'Silver moon',         s: 'Cool and distant',  f: 'marine' },
        { t: 'Embers of a fire',    s: 'Red and fading',    f: 'oriental' } ] },
      { q: 'A scent should feel…', a: [
        { t: 'Luminous',  s: 'Bright, awake, transparent', f: 'citrus' },
        { t: 'Enveloping', s: 'Close, warm, golden',       f: 'amber' },
        { t: 'Mysterious', s: 'Dark, resinous, deep',      f: 'oriental' },
        { t: 'Alive',     s: 'Green, dewy, in bloom',      f: 'floral' } ] },
      { q: 'Which weather do you love?', a: [
        { t: 'A clear bright morning', s: '', f: 'citrus' },
        { t: 'A gathering storm',      s: '', f: 'marine' },
        { t: 'Heat held in still air', s: '', f: 'amber' },
        { t: 'Mist among the trees',   s: '', f: 'wood' } ] },
      { q: 'What do you want it to leave behind?', a: [
        { t: 'A memory of someone',  s: 'Intimate and warm',  f: 'amber' },
        { t: 'A sense of escape',    s: 'Open and free',      f: 'marine' },
        { t: 'An air of intrigue',   s: 'Smoke and shadow',   f: 'oriental' },
        { t: 'A feeling of bloom',   s: 'Soft and tender',    f: 'floral' } ] }
    ];

    let idx = 0; const scores = {};

    function render () {
      const Q = QS[idx];
      fill.style.width = (idx / QS.length * 100) + '%';
      stage.classList.add('is-leaving');
      setTimeout(() => {
        stage.innerHTML =
          `<span class="quiz__q-no">Question ${String(idx + 1).padStart(2, '0')} / ${String(QS.length).padStart(2, '0')}</span>
           <h3 class="quiz__q-text">${Q.q}</h3>
           <div class="quiz__options">` +
          Q.a.map((o, i) => `<button class="quiz__opt" data-f="${o.f}" data-cursor>${o.t}${o.s ? `<small>${o.s}</small>` : ''}</button>`).join('') +
          `</div>`;
        stage.classList.remove('is-leaving');
        $$('.quiz__opt', stage).forEach(btn => btn.addEventListener('click', () => {
          const f = btn.dataset.f; scores[f] = (scores[f] || 0) + 1;
          idx++;
          if (idx < QS.length) render(); else finish();
        }));
      }, idx === 0 ? 0 : 380);
    }

    function finish () {
      fill.style.width = '100%';
      stage.classList.add('is-leaving');
      const top = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'amber';
      const fam = FAMILIES[top];
      setTimeout(() => {
        stage.hidden = true;
        result.hidden = false;
        $('#resultName').textContent = fam.name;
        $('#resultLine').textContent = fam.line;
        $('#resultPick').textContent = fam.pick;
        $('#quiz').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 420);
    }

    $('#quizRestart').addEventListener('click', () => {
      idx = 0; for (const k in scores) delete scores[k];
      result.hidden = true; stage.hidden = false; render();
    });

    render();
  })();

})();
