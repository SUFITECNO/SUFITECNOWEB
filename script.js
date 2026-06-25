/**
 * Sufi Tecno site — single entry point wired from index.html
 */
(function () {
  'use strict';

  /* WOW.js */
  if (typeof WOW === 'function') {
    new WOW({ offset: 60, mobile: false }).init();
  }

  /* Navbar: mobile toggle, scroll spy, smooth scroll */
  (function () {
    const toggler = document.getElementById('navToggler');
    const collapse = document.getElementById('navMenu');

    function setNavOpen(isOpen) {
      if (!toggler || !collapse) return;
      collapse.classList.toggle('show', isOpen);
      toggler.classList.toggle('is-active', isOpen);
      toggler.setAttribute('aria-expanded', String(isOpen));
      toggler.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }

    if (toggler && collapse) {
      toggler.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setNavOpen(!collapse.classList.contains('show'));
      });

      document.addEventListener('click', (e) => {
        if (!collapse.classList.contains('show')) return;
        if (!toggler.contains(e.target) && !collapse.contains(e.target)) {
          setNavOpen(false);
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) setNavOpen(false);
      });
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-item a');

    window.addEventListener(
      'scroll',
      () => {
        let current = '';
        sections.forEach((s) => {
          if (window.pageYOffset >= s.offsetTop - 100) {
            current = s.getAttribute('id');
          }
        });
        navLinks.forEach((a) => {
          a.classList.remove('active');
          const href = a.getAttribute('href');
          if (href && current && href.includes(current)) {
            a.classList.add('active');
          }
        });
      },
      { passive: true }
    );

    document.querySelectorAll('.ud-menu-scroll, a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href === 'javascript:void(0)') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (collapse?.classList.contains('show')) setNavOpen(false);
        }
      });
    });
  })();

  /* Back to top */
  (function () {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener(
      'scroll',
      () => btn.classList.toggle('show', window.pageYOffset > 400),
      { passive: true }
    );
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  })();

  /* Chat widget */
  (function () {
    const widget = document.querySelector('[data-chat-widget]');
    const trigger = document.querySelector('[data-chat-trigger]');
    const close = document.querySelector('[data-chat-close]');
    if (!widget || !trigger) return;

    function setOpen(isOpen) {
      widget.classList.toggle('is-open', isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
    }

    trigger.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
    close?.addEventListener('click', () => {
      setOpen(false);
      trigger.focus();
    });
    document.addEventListener('click', (e) => {
      if (!widget.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });
  })();

  /* Contact form → Google Sheets */
  (function () {
    const form = document.querySelector('.ud-contact-form');
    const status = document.querySelector('[data-form-status]');
    const statusTitle = document.querySelector('[data-form-status-title]');
    const statusMsg = document.querySelector('[data-form-status-message]');

    function showStatus(state, title, msg) {
      if (!status || !statusTitle || !statusMsg) return;
      status.classList.remove('is-done', 'is-error');
      if (state) status.classList.add(`is-${state}`);
      statusTitle.textContent = title;
      statusMsg.textContent = msg;
      status.classList.add('is-visible');
      status.setAttribute('aria-hidden', 'false');
    }

    function hideStatus(delay = 0) {
      window.setTimeout(() => {
        status?.classList.remove('is-visible', 'is-done', 'is-error');
        status?.setAttribute('aria-hidden', 'true');
      }, delay);
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const endpoint = form.dataset.googleSheetEndpoint;
      const btn = form.querySelector('button[type="submit"]');

      if (!endpoint || endpoint.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        showStatus('error', 'Google Sheet is not connected yet', 'Add your Google Apps Script Web App URL to the form.');
        hideStatus(3200);
        return;
      }

      const data = new FormData(form);
      data.append('submittedAt', new Date().toLocaleString());
      data.append('source', window.location.href);

      showStatus('sending', 'Sending the message', 'Please wait while we save your enquiry.');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      try {
        await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) });
        showStatus('done', 'Done!', 'Your message has been sent successfully.');
        form.reset();
        hideStatus(2600);
      } catch {
        showStatus('error', 'Message was not sent', 'Please check your connection and try again.');
        hideStatus(3600);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Send Message';
        }
      }
    });
  })();

  /* Hero binary cursor */
  (function () {
    const hero = document.querySelector('#home');
    const canvas = document.querySelector('[data-binary-cursor]');
    if (!hero || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const MAX = 120;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = null;
    let lastSpawn = 0;
    let lastFrame = 0;

    function resize() {
      const r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(cx, cy) {
      const now = performance.now();
      if (now - lastSpawn < 18) return;
      lastSpawn = now;
      const rect = hero.getBoundingClientRect();
      const x = cx - rect.left;
      const y = cy - rect.top;
      const n = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < n; i += 1) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
        const spd = 16 + Math.random() * 45;
        particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * spd + (Math.random() - 0.5) * 22,
          vy: Math.sin(angle) * spd - Math.random() * 24,
          life: 0,
          ttl: 780 + Math.random() * 340,
          size: 11 + Math.random() * 9,
          rot: (Math.random() - 0.5) * 0.45,
          digit: Math.random() > 0.5 ? '1' : '0',
          hue: Math.random() > 0.35 ? '72, 245, 180' : '0, 194, 255',
        });
      }

      if (particles.length > MAX) particles.splice(0, particles.length - MAX);
      if (!raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(draw);
      }
    }

    function draw(ts) {
      const el = lastFrame ? Math.min(ts - lastFrame, 32) : 16.67;
      lastFrame = ts;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life += el;
        const prog = Math.min(p.life / p.ttl, 1);
        const dt = el / 1000;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 - 8 * dt;

        if (prog >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const d = 1 - prog;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * prog);
        ctx.globalAlpha = Math.pow(d, 1.45) * 0.82;
        ctx.font = `${p.size * (0.45 + d * 0.55)}px Consolas, monospace`;
        ctx.fillStyle = `rgba(${p.hue}, ${0.42 + d * 0.34})`;
        ctx.shadowColor = `rgba(${p.hue}, 0.55)`;
        ctx.shadowBlur = 12 * d;
        ctx.fillText(p.digit, 0, 0);
        ctx.restore();
      }

      raf = particles.length > 0 ? requestAnimationFrame(draw) : null;
      if (!raf) lastFrame = 0;
    }

    resize();
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'touch') spawn(e.clientX, e.clientY);
    });
    hero.addEventListener('pointerleave', () => {
      lastSpawn = 0;
    });
  })();

  /* Features carousel */
  (function () {
    const track = document.getElementById('featuresTrack');
    const prev = document.getElementById('featuresPrev');
    const next = document.getElementById('featuresNext');
    if (!track) return;

    function slideW() {
      const s = track.querySelector('.ud-feature-slide');
      return s ? s.offsetWidth + 22 : 290;
    }

    function updateArrows() {
      if (!prev || !next) return;
      prev.classList.toggle('is-hidden', track.scrollLeft <= 4);
      next.classList.toggle('is-hidden', track.scrollLeft >= track.scrollWidth - track.clientWidth - 4);
    }

    track.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();

    prev?.addEventListener('click', () => track.scrollBy({ left: -slideW(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: slideW(), behavior: 'smooth' }));

    track.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        track.scrollBy({ left: e.deltaY * 2.2, behavior: 'smooth' });
      },
      { passive: false }
    );

    let down = false;
    let sx = 0;
    let sl = 0;
    track.addEventListener('mousedown', (e) => {
      down = true;
      track.classList.add('is-grabbing');
      sx = e.pageX - track.offsetLeft;
      sl = track.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      down = false;
      track.classList.remove('is-grabbing');
    });
    track.addEventListener('mousemove', (e) => {
      if (!down) return;
      e.preventDefault();
      track.scrollLeft = sl - (e.pageX - track.offsetLeft - sx) * 1.4;
    });
  })();

  /* Catalog modal — supports data-catalog JSON with {src,name} or {name,textOnly:true} */
  (function () {
    const modal    = document.getElementById('catalogModal');
    const titleEl  = document.getElementById('catalogModalTitle');
    const imgTrack = document.getElementById('catalogImageTrack');
    const closeBtn = document.getElementById('catalogModalClose');
    const emptyMsg = document.getElementById('catalogEmpty');
    const imgPrev  = document.getElementById('catalogImgPrev');
    const imgNext  = document.getElementById('catalogImgNext');
    const dotsWrap = document.getElementById('catalogDots');
    if (!modal || !titleEl || !imgTrack || !emptyMsg || !dotsWrap) return;

    let scrollHandler = null;

    // ── Dot sync ──────────────────────────────────────────────────
    function updateDots() {
      const slides = [...imgTrack.children];
      const dots   = [...dotsWrap.querySelectorAll('.catalog-dot')];
      if (!slides.length) return;
      const mid = imgTrack.scrollLeft + imgTrack.clientWidth / 2;
      let closest = 0, minDist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < minDist) { minDist = d; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closest));
    }

    // ── Build a single dot ────────────────────────────────────────
    function makeDot(index, isFirst) {
      const dot = document.createElement('div');
      dot.className = 'catalog-dot' + (isFirst ? ' active' : '');
      dot.addEventListener('click', () => {
        const slide = imgTrack.children[index];
        if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      return dot;
    }

    // ── Build an image slide ──────────────────────────────────────
    function makeImageSlide(item) {
      const slide = document.createElement('div');
      slide.className = 'ud-catalog-image-slide';

      const imgArea = document.createElement('div');
      imgArea.className = 'ud-catalog-img-area';

      const img = document.createElement('img');
      img.src     = item.src;
      img.alt     = item.name || '';
      img.loading = 'lazy';

      imgArea.appendChild(img);

      const nameBar = document.createElement('div');
      nameBar.className   = 'ud-catalog-slide-name';
      nameBar.textContent = item.name || '';

      slide.appendChild(imgArea);
      slide.appendChild(nameBar);
      return slide;
    }

    // ── Build a text-only slide ───────────────────────────────────
    function makeTextSlide(item) {
      const slide = document.createElement('div');
      slide.className = 'ud-catalog-text-slide';

      const icon = document.createElement('div');
      icon.className = 'ud-catalog-text-icon';
      icon.innerHTML = '<i class="lni lni-shield"></i>';

      const nameEl = document.createElement('div');
      nameEl.className   = 'ud-catalog-text-name';
      nameEl.textContent = item.name || '';

      slide.appendChild(icon);
      slide.appendChild(nameEl);
      return slide;
    }

    // ── Open modal ────────────────────────────────────────────────
    function openModal(title, catalog) {
      titleEl.textContent = title;
      imgTrack.innerHTML  = '';
      dotsWrap.innerHTML  = '';

      if (scrollHandler) {
        imgTrack.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
      }

      const list = catalog || [];
      const has  = list.length > 0;

      if (emptyMsg) emptyMsg.style.display = has ? 'none' : 'block';
      imgTrack.style.display = has ? 'flex' : 'none';

      const multi = has && list.length > 1;
      dotsWrap.style.display = multi ? 'flex' : 'none';
      if (imgPrev) imgPrev.style.display = multi ? 'flex' : 'none';
      if (imgNext) imgNext.style.display = multi ? 'flex' : 'none';

      if (has) {
        list.forEach((item, i) => {
          const slide = item.textOnly ? makeTextSlide(item) : makeImageSlide(item);
          imgTrack.appendChild(slide);
          dotsWrap.appendChild(makeDot(i, i === 0));
        });

        imgTrack.scrollLeft = 0;
        scrollHandler = updateDots;
        imgTrack.addEventListener('scroll', scrollHandler, { passive: true });
      }

      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    // ── Wire catalog buttons ──────────────────────────────────────
    document.querySelectorAll('.ud-catalog-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        let catalog = [];
        try {
          // Support both new data-catalog and legacy data-images
          const raw = btn.dataset.catalog || btn.dataset.images;
          const parsed = JSON.parse(raw || '[]');
          // Normalise legacy format (plain strings → {src})
          catalog = parsed.map((item) =>
            typeof item === 'string' ? { src: item, name: '' } : item
          );
        } catch {
          catalog = [];
        }
        openModal(btn.dataset.title || 'Catalog', catalog);
      });
    });

    // ── Close triggers ────────────────────────────────────────────
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // ── Scroll helpers ────────────────────────────────────────────
    function slideW() {
      const s = imgTrack.firstElementChild;
      return s ? s.offsetWidth + 18 : 318;
    }

    imgPrev?.addEventListener('click', () => imgTrack.scrollBy({ left: -slideW(), behavior: 'smooth' }));
    imgNext?.addEventListener('click', () => imgTrack.scrollBy({ left:  slideW(), behavior: 'smooth' }));

    imgTrack.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      imgTrack.scrollBy({ left: e.deltaY * 2.2, behavior: 'smooth' });
    }, { passive: false });

    let down = false, sx = 0, sl = 0;
    imgTrack.addEventListener('mousedown', (e) => {
      down = true; imgTrack.classList.add('is-grabbing');
      sx = e.pageX - imgTrack.offsetLeft; sl = imgTrack.scrollLeft;
    });
    window.addEventListener('mouseup', () => { down = false; imgTrack.classList.remove('is-grabbing'); });
    imgTrack.addEventListener('mousemove', (e) => {
      if (!down) return;
      e.preventDefault();
      imgTrack.scrollLeft = sl - (e.pageX - imgTrack.offsetLeft - sx) * 1.4;
    });
  })();
})();