/* ============================================================
   CHATSC — LANDING PAGE SCRIPTS
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     RAF SCROLL DISPATCHER — single throttled scroll handler
     All scroll-dependent logic registers here to avoid
     multiple event listeners thrashing the main thread.
     ---------------------------------------------------------- */
  const _scrollCallbacks = [];
  let _rafPending = false;

  function _onScrollRAF() {
    _scrollCallbacks.forEach(function (cb) { cb(); });
    _rafPending = false;
  }

  function _onScroll() {
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(_onScrollRAF);
  }

  window.addEventListener('scroll', _onScroll, { passive: true });

  function onScroll(cb) {
    _scrollCallbacks.push(cb);
  }

  /* ----------------------------------------------------------
     NAVBAR — Scroll behavior + sticky
     ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  onScroll(handleNavbarScroll);
  handleNavbarScroll(); // Run on load

  /* Keep mobile browsers from preserving a horizontal page offset. */
  if (window.matchMedia('(max-width: 768px)').matches) {
    const resetHorizontalScroll = function () {
      const scrollingElement = document.scrollingElement || document.documentElement;
      if (scrollingElement.scrollLeft !== 0) scrollingElement.scrollLeft = 0;
    };

    window.addEventListener('scroll', resetHorizontalScroll, { passive: true });
    window.addEventListener('resize', resetHorizontalScroll, { passive: true });
    window.addEventListener('pageshow', resetHorizontalScroll, { passive: true });
    resetHorizontalScroll();
  }


  /* ----------------------------------------------------------
     MOBILE MENU
     ---------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu   = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.classList.remove('active');
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.classList.toggle('active', isOpen);
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Hamburger animation
    const style = document.createElement('style');
    style.textContent = `
      .nav-mobile-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
      .nav-mobile-toggle.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .nav-mobile-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
      .nav-mobile-toggle span { transition: all 0.3s ease; display: block; }
    `;
    document.head.appendChild(style);
  }


  /* ----------------------------------------------------------
     SMOOTH SCROLL — anchor links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ----------------------------------------------------------
     SCROLL REVEAL — IntersectionObserver
     ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.10,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  function initReveal() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Hero elements are above-the-fold — animate them immediately
    document.querySelectorAll('.hero .reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  initReveal();


  /* ----------------------------------------------------------
     FAQ — Accordion
     ---------------------------------------------------------- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = this.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all open items
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ----------------------------------------------------------
     HERO MOCKUP — Subtle parallax on mouse move
     ---------------------------------------------------------- */
  const heroMockup = document.querySelector('.hero-mockup');
  const heroSection = document.querySelector('.hero');

  if (heroMockup && heroSection && window.matchMedia('(min-width: 1024px)').matches) {
    let heroRect = heroSection.getBoundingClientRect();

    window.addEventListener('resize', function () {
      heroRect = heroSection.getBoundingClientRect();
    }, { passive: true });

    heroSection.addEventListener('mousemove', function (e) {
      const x = (e.clientX - heroRect.left) / heroRect.width - 0.5;
      const y = (e.clientY - heroRect.top) / heroRect.height - 0.5;

      heroMockup.style.transform = `
        translateY(${-16 * Math.sin(Date.now() / 3000)}px)
        rotate(${x * 3}deg)
        rotateY(${x * 5}deg)
      `;
    });

    heroSection.addEventListener('mouseleave', function () {
      heroMockup.style.transform = '';
    });
  }


  /* ----------------------------------------------------------
     ACTIVE NAV LINK — Highlight on scroll
     ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-50% 0px -50% 0px'
    }
  );

  sections.forEach(function (section) { navObserver.observe(section); });

  // Active nav link style — adapts to light navbar when scrolled
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    .nav-links a.active { color: var(--purple) !important; }
    .nav-links a.active::after { transform: scaleX(1) !important; background: var(--grad-brand); }
    .navbar:not(.scrolled) .nav-links a.active { color: #fff !important; }
  `;
  document.head.appendChild(activeStyle);


  /* ----------------------------------------------------------
     COUNTER ANIMATION — Benefit numbers
     ---------------------------------------------------------- */
  function animateCounter(el, target, duration) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(function () {
      start += step;
      if (start >= target) {
        el.textContent = target < 10 ? '0' + target : target;
        clearInterval(timer);
      } else {
        const val = Math.floor(start);
        el.textContent = val < 10 ? '0' + val : val;
      }
    }, 16);
  }


  /* ----------------------------------------------------------
     FEATURE CARD HOVER — Icon glow enhancement
     ---------------------------------------------------------- */
  document.querySelectorAll('.feature-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      const icon = this.querySelector('.feature-icon');
      if (icon) {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
        icon.style.transition = 'transform 0.3s ease';
      }
    });
    card.addEventListener('mouseleave', function () {
      const icon = this.querySelector('.feature-icon');
      if (icon) {
        icon.style.transform = '';
      }
    });
  });


  /* ----------------------------------------------------------
     KEYBOARD NAVIGATION — FAQ accessibility
     ---------------------------------------------------------- */
  document.querySelectorAll('.faq-question').forEach(function (btn, index, all) {
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = all[index + 1];
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = all[index - 1];
        if (prev) prev.focus();
      }
    });
  });


  /* ----------------------------------------------------------
     REDUCED MOTION — Respect prefers-reduced-motion
     ---------------------------------------------------------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      .reveal { opacity: 1; transform: none; }
    `;
    document.head.appendChild(style);
  }


  /* ----------------------------------------------------------
     ROCKET CANVAS ANIMATION — CTA Section
     ---------------------------------------------------------- */
  (function initRocketCanvas() {
    // Skip if reduced motion is preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('rocket-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;

    /* ---- Resize ---- */
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = rect.width;
      H = canvas.height = rect.height;
    }

    /* ---- Stars ---- */
    const STAR_COUNT = 90;
    const stars = [];

    function createStar() {
      return {
        x: Math.random() * (W || 800),
        y: Math.random() * (H || 400),
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.7 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      };
    }

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar());
    }

    function drawStars(t) {
      stars.forEach(s => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha > 0.9 || s.alpha < 0.05) s.twinkleDir *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${s.alpha})`;
        ctx.fill();
      });
    }

    /* ---- Shooting stars ---- */
    const SHOOT_COUNT = 3;
    const shooters = [];

    function createShooter() {
      return {
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.4,
        len: Math.random() * 120 + 60,
        speed: Math.random() * 6 + 4,
        angle: Math.PI / 6,
        alpha: 0,
        phase: 'in',  // in | travel | out | wait
        waitFrames: Math.floor(Math.random() * 160 + 80),
      };
    }

    function initShooters() {
      shooters.length = 0;
      for (let i = 0; i < SHOOT_COUNT; i++) {
        const s = createShooter();
        s.waitFrames = Math.floor(Math.random() * 200 + i * 80);
        s.phase = 'wait';
        shooters.push(s);
      }
    }

    function drawShooters() {
      shooters.forEach((s, idx) => {
        if (s.phase === 'wait') {
          s.waitFrames--;
          if (s.waitFrames <= 0) {
            Object.assign(s, createShooter());
            s.phase = 'in';
          }
          return;
        }

        if (s.phase === 'in') {
          s.alpha = Math.min(s.alpha + 0.06, 0.9);
          if (s.alpha >= 0.9) s.phase = 'travel';
        }
        if (s.phase === 'travel') {
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          if (s.x > W * 0.9 || s.y > H * 0.8) s.phase = 'out';
        }
        if (s.phase === 'out') {
          s.alpha = Math.max(s.alpha - 0.06, 0);
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          if (s.alpha <= 0) {
            s.phase = 'wait';
            s.waitFrames = Math.floor(Math.random() * 200 + 60);
          }
        }

        if (s.alpha <= 0) return;
        const grd = ctx.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        );
        grd.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
        grd.addColorStop(0.3, `rgba(180,130,255,${s.alpha * 0.6})`);
        grd.addColorStop(1, 'rgba(101,66,232,0)');
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        );
        ctx.strokeStyle = grd;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    }

    /* ---- Particles (exhaust) ---- */
    const particles = [];
    const MAX_PARTICLES = 70;

    function spawnParticle(x, y, vx, vy) {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({
        x, y,
        vx: vx + (Math.random() - 0.5) * 1.5,
        vy: vy + (Math.random() - 0.5) * 1.5,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.012,
        r: Math.random() * 3 + 1,
        hue: Math.random() > 0.5 ? 217 : 300,  // purple or pink
      });
    }

    function updateAndDrawParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.r *= 0.97;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life * 0.8})`;
        ctx.fill();
      }
    }

    /* ---- Rocket ---- */
    const rocket = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0,
      mode: 'wander',
      trail: [],
      MAX_TRAIL: 55,
    };

    function chooseWanderTarget() {
      const edgePadding = Math.min(90, W * 0.12, H * 0.18);
      rocket.targetX = edgePadding + Math.random() * Math.max(1, W - edgePadding * 2);
      rocket.targetY = edgePadding + Math.random() * Math.max(1, H - edgePadding * 2);
      rocket.mode = 'wander';
    }

    function initialiseRocket() {
      rocket.x = W * 0.75;
      rocket.y = H * 0.5;
      rocket.vx = 0;
      rocket.vy = 0;
      chooseWanderTarget();
      rocket.trail.length = 0;
    }

    function updateRocket() {
      const dx = rocket.targetX - rocket.x;
      const dy = rocket.targetY - rocket.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 24) chooseWanderTarget();

      const activeDx = rocket.targetX - rocket.x;
      const activeDy = rocket.targetY - rocket.y;
      const activeDistance = Math.max(1, Math.hypot(activeDx, activeDy));
      const maxSpeed = rocket.mode === 'follow' ? 3.2 : 2.1;
      const desiredVx = (activeDx / activeDistance) * maxSpeed;
      const desiredVy = (activeDy / activeDistance) * maxSpeed;

      rocket.vx += (desiredVx - rocket.vx) * 0.035;
      rocket.vy += (desiredVy - rocket.vy) * 0.035;
      rocket.x += rocket.vx;
      rocket.y += rocket.vy;
    }

    function drawRocket(x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const S = 18; // scale factor

      // --- Glow halo ---
      const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, S * 2.2);
      halo.addColorStop(0, 'rgba(217,95,186,0.45)');
      halo.addColorStop(0.5, 'rgba(101,66,232,0.18)');
      halo.addColorStop(1, 'rgba(101,66,232,0)');
      ctx.beginPath();
      ctx.arc(0, 0, S * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // --- Body (fuselage) ---
      const bodyGrd = ctx.createLinearGradient(-S * 0.4, -S * 0.9, S * 0.4, S * 0.9);
      bodyGrd.addColorStop(0, '#e8e0ff');
      bodyGrd.addColorStop(0.4, '#a78bfa');
      bodyGrd.addColorStop(1, '#6542E8');
      ctx.beginPath();
      ctx.moveTo(0, -S);           // nose tip
      ctx.bezierCurveTo(S * 0.45, -S * 0.5, S * 0.45, S * 0.5, 0, S * 0.9);
      ctx.bezierCurveTo(-S * 0.45, S * 0.5, -S * 0.45, -S * 0.5, 0, -S);
      ctx.fillStyle = bodyGrd;
      ctx.fill();

      // --- Window ---
      ctx.beginPath();
      ctx.arc(0, -S * 0.12, S * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,198,255,0.85)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-S * 0.06, -S * 0.18, S * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();

      // --- Left fin ---
      ctx.beginPath();
      ctx.moveTo(-S * 0.3, S * 0.5);
      ctx.lineTo(-S * 0.75, S * 0.95);
      ctx.lineTo(-S * 0.15, S * 0.9);
      ctx.closePath();
      ctx.fillStyle = '#D95FBA';
      ctx.fill();

      // --- Right fin ---
      ctx.beginPath();
      ctx.moveTo(S * 0.3, S * 0.5);
      ctx.lineTo(S * 0.75, S * 0.95);
      ctx.lineTo(S * 0.15, S * 0.9);
      ctx.closePath();
      ctx.fillStyle = '#D95FBA';
      ctx.fill();

      ctx.restore();
    }

    function drawTrail() {
      for (let i = 1; i < rocket.trail.length; i++) {
        const p = rocket.trail[i];
        const prev = rocket.trail[i - 1];
        const prog = i / rocket.trail.length;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        const hue = prog > 0.6 ? 300 : 217;
        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${prog * 0.55})`;
        ctx.lineWidth = prog * 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    /* ---- Main loop ---- */
    function tick() {
      ctx.clearRect(0, 0, W, H);

      drawStars();
      drawShooters();
      updateRocket();

      const angle = Math.atan2(rocket.vy, rocket.vx) + Math.PI / 2;

      // Trail
      rocket.trail.push({ x: rocket.x, y: rocket.y });
      if (rocket.trail.length > rocket.MAX_TRAIL) rocket.trail.shift();

      drawTrail();
      drawRocket(rocket.x, rocket.y, angle);

      // Exhaust particles — spawn behind rocket nose direction
      const exAngle = angle + Math.PI;
      for (let i = 0; i < 3; i++) {
        spawnParticle(
          rocket.x + Math.sin(exAngle) * 12,
          rocket.y - Math.cos(exAngle) * 12,
          Math.sin(exAngle) * (Math.random() * 2 + 1),
          -Math.cos(exAngle) * (Math.random() * 2 + 1)
        );
      }
      updateAndDrawParticles();

      raf = requestAnimationFrame(tick);
    }

    /* ---- IntersectionObserver — only animate when in view ---- */
    const ctaSection = document.getElementById('cta');
    if (!ctaSection) return;

    const ctaObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!raf) {
            resize();
            initStars();
            initShooters();
            initialiseRocket();
            tick();
          }
        } else {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
    }, { threshold: 0.05 });

    ctaObserver.observe(ctaSection);
    ctaSection.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = ctaSection.getBoundingClientRect();
      rocket.targetX = event.clientX - rect.left;
      rocket.targetY = event.clientY - rect.top;
      rocket.mode = 'follow';
    }, { passive: true });

    window.addEventListener('resize', () => {
      resize();
      initStars();
      initShooters();
      initialiseRocket();
    }, { passive: true });
  })();


  /* ----------------------------------------------------------
     INIT LOG
     ---------------------------------------------------------- */
  console.log('%cChatSC Landing Page 🚀', 'color: #6542E8; font-size: 18px; font-weight: bold;');
  console.log('%cTransformar organização em encantamento.', 'color: #D95FBA; font-size: 13px;');

})();


/* ============================================================
   PARALLAX & PREMIUM INTERACTIONS — outside IIFE for perf
   ============================================================ */
(function initPremiumEffects() {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     SUBTLE PARALLAX on sections with .bg-orb
     ---------------------------------------------------------- */
  if (!prefersReduced && window.matchMedia('(min-width: 768px)').matches) {
    const orbs = document.querySelectorAll('.bg-orb');

    /* Uses the RAF dispatcher from the main IIFE — no extra listeners */
    window.addEventListener('scroll', function () {
      const sy = window.scrollY;
      orbs.forEach(function (orb, i) {
        const speed = (i % 2 === 0) ? 0.10 : 0.06;
        orb.style.transform = 'translateY(' + (sy * speed) + 'px)';
      });
    }, { passive: true });
  }



  /* ----------------------------------------------------------
     PRICING VALUE COUNTER animation (on section enter)
     ---------------------------------------------------------- */
  function animateValue(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.floor(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const pricingObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.pricing-value[data-target]').forEach(function (el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        animateValue(el, 0, target, 1200);
      });
      pricingObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  const pricingSection = document.getElementById('precos');
  if (pricingSection) pricingObserver.observe(pricingSection);

  /* ----------------------------------------------------------
     BENEFIT NUMBER COUNTER
     ---------------------------------------------------------- */
  const benefitObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const nums = ['01', '02', '03'];
      entry.target.querySelectorAll('.benefit-number').forEach(function (el, i) {
        let count = 0;
        const target = i + 1;
        const timer = setInterval(function () {
          count++;
          el.textContent = count < 10 ? '0' + count : count;
          if (count >= target) clearInterval(timer);
        }, 80);
      });
      benefitObserver.unobserve(entry.target);
    });
  }, { threshold: 0.30 });

  const benefitsSection = document.querySelector('.benefits-section');
  if (benefitsSection) benefitObserver.observe(benefitsSection);

  /* ----------------------------------------------------------
     MAGNETIC BUTTON effect on primary CTA buttons
     ---------------------------------------------------------- */
  if (!prefersReduced && window.matchMedia('(min-width: 1024px)').matches) {
    document.querySelectorAll('.btn-primary').forEach(function (btn) {
      let buttonRect;

      btn.addEventListener('mouseenter', function () {
        buttonRect = btn.getBoundingClientRect();
      });

      btn.addEventListener('mousemove', function (e) {
        if (!buttonRect) return;
        const x = e.clientX - buttonRect.left - buttonRect.width / 2;
        const y = e.clientY - buttonRect.top - buttonRect.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.20}px)`;
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     STAGGER ANIMATION for pricing features list items
     ---------------------------------------------------------- */
  const featureListObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const items = entry.target.querySelectorAll('.pricing-features li');
      items.forEach(function (item, idx) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        item.style.transitionDelay = (idx * 50) + 'ms';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            item.style.opacity = '';
            item.style.transform = '';
          });
        });
      });
      featureListObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.pricing-card').forEach(function (card) {
    featureListObserver.observe(card);
  });

  /* ----------------------------------------------------------
     CARD TILT on hover — pricing cards
     ---------------------------------------------------------- */
  if (!prefersReduced && window.matchMedia('(min-width: 768px)').matches) {
    document.querySelectorAll('.pricing-card').forEach(function (card) {
      let cardRect;

      card.addEventListener('mouseenter', function () {
        cardRect = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', function (e) {
        if (!cardRect) return;
        const cx = cardRect.left + cardRect.width / 2;
        const cy = cardRect.top + cardRect.height / 2;
        const dx = (e.clientX - cx) / (cardRect.width / 2);
        const dy = (e.clientY - cy) / (cardRect.height / 2);
        // Skip tilt for Pro card (already scaled)
        const isProCard = card.classList.contains('pricing-card-pro');
        const scale = isProCard ? 'scale(1.04)' : 'scale(1.01)';
        card.style.transform = `${scale} perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', function () {
        const isProCard = card.classList.contains('pricing-card-pro');
        card.style.transform = isProCard ? 'scale(1.04)' : '';
        card.style.transition = 'transform 0.4s ease';
      });

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.1s ease, border-color 0.3s ease, box-shadow 0.3s ease';
      });
    });
  }

  /* ----------------------------------------------------------
     SMOOTH SECTION TRANSITIONS — add data-scroll attribute
     ---------------------------------------------------------- */
  const allSections = document.querySelectorAll('section');
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-in-view', 'true');
      }
    });
  }, { threshold: 0.05 });

  allSections.forEach(function (s) { sectionObserver.observe(s); });


  /* ----------------------------------------------------------
     PRODUCT SCREENSHOTS — TAB SWITCHING
     ---------------------------------------------------------- */
  const screenTabs = document.querySelectorAll('.screen-tab');
  const screenPanels = document.querySelectorAll('.screen-panel');

  if (screenTabs.length && screenPanels.length) {
    screenTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const targetTabId = 'tab-' + this.getAttribute('data-tab');

        screenTabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        screenPanels.forEach(function (p) {
          p.classList.remove('active');
        });

        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        const activePanel = document.getElementById(targetTabId);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

})();
