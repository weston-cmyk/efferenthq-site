/* EfferentHQ — Particle + Interaction System */
(function () {

  /* ── Particle Canvas ── */
  function initParticles(canvasId, cfg) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const opts = Object.assign({
      count: 90,
      maxSize: 1.6,
      minOpacity: 0.12,
      maxOpacity: 0.55,
      speed: 0.22,
      connectionDist: 130,
      connectionAlpha: 0.07,
      color: '255,255,255'
    }, cfg);

    let particles = [];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function spawn() {
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * opts.speed,
        vy: (Math.random() - 0.5) * opts.speed,
        r:  Math.random() * opts.maxSize + 0.4,
        a:  Math.random() * (opts.maxOpacity - opts.minOpacity) + opts.minOpacity
      };
    }

    function init() {
      particles = Array.from({ length: opts.count }, spawn);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        /* dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${opts.color},${p.a})`;
        ctx.fill();

        /* connections */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < opts.connectionDist * opts.connectionDist) {
            const fade = opts.connectionAlpha * (1 - Math.sqrt(d2) / opts.connectionDist);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${opts.color},${fade})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
  }

  window.initParticles = initParticles;

  /* ── Global Ambient Particles ("snow") ── */
  function initAmbientParticles(cfg) {
    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-particles';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:50;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const opts = Object.assign({
      count: 120,
      maxSize: 1.4,
      minSize: 0.3,
      minOpacity: 0.06,
      maxOpacity: 0.25,
      speed: 0.12,
      drift: 0.02,
      color: '255,255,255'
    }, cfg);

    let dots = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function spawn(randomY) {
      return {
        x:  Math.random() * w,
        y:  randomY ? Math.random() * h : -10,
        vx: (Math.random() - 0.5) * opts.drift,
        vy: Math.random() * opts.speed + 0.05,
        r:  Math.random() * (opts.maxSize - opts.minSize) + opts.minSize,
        a:  Math.random() * (opts.maxOpacity - opts.minOpacity) + opts.minOpacity,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.015
      };
    }

    function init() {
      dots = Array.from({ length: opts.count }, () => spawn(true));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        d.pulse += d.pulseSpeed;

        const twinkle = d.a * (0.6 + 0.4 * Math.sin(d.pulse));

        if (d.y > h + 10 || d.x < -10 || d.x > w + 10) {
          dots[i] = spawn(false);
          dots[i].x = Math.random() * w;
          continue;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${opts.color},${twinkle})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); });
  }

  window.initAmbientParticles = initAmbientParticles;

  /* Auto-init ambient particles on every page */
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientParticles({ count: 140, maxOpacity: 0.22, speed: 0.1, maxSize: 1.3 });
  });

  /* ── Pricing Tab Switch ── */
  window.switchTab = function (tab) {
    document.querySelectorAll('.pricing-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pricing-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.pricing-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`panel-${tab}`).classList.add('active');
  };

  /* ── FAQ Accordion ── */
  window.toggleFaq = function (btn) {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  };

  /* ── Mobile Nav ── */
  window.toggleMobileNav = function () {
    const links = document.getElementById('navLinks');
    links.classList.toggle('open');
  };

  /* ── Resources Filter ── */
  window.filterResources = function (btn, tag) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.article-card').forEach(card => {
      card.style.display = (tag === 'all' || card.dataset.tag === tag) ? '' : 'none';
    });
  };

  /* ── Scroll-based Nav ── */
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.style.background = window.scrollY > 40
          ? 'rgba(14,15,26,0.98)'
          : 'rgba(14,15,26,0.88)';
      });
    }

    /* Highlight active page in nav */
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links > li > a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });

    /* Fade-in on scroll */
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  });

})();
