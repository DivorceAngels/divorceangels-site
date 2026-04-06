// ═══════════════════════════════════
// DIVORCE ANGELS — SHARED JS
// ═══════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky nav shadow
  const nav = document.getElementById('navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Mark active nav link
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  // ── Intersection observer for fade-up
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  // ── Newsletter form
  document.querySelectorAll('.nl-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.nl-input');
      const btn   = form.querySelector('.nl-btn');
      if (!input.value || !input.value.includes('@')) {
        input.style.borderColor = '#C4714A';
        input.focus();
        return;
      }
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#7FA98B';
      input.value = '';
      input.disabled = true;
      btn.disabled = true;
    });
  });

  // ── Category pill filter (blog page)
  const pills = document.querySelectorAll('.cat-pill[data-filter]');
  const cards = document.querySelectorAll('.filterable-card');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
        card.style.opacity  = show ? '1' : '0';
      });
    });
  });

  // ── Mobile nav toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.style.display === 'flex';
      mobileNav.style.display = open ? 'none' : 'flex';
      menuBtn.textContent = open ? '☰' : '✕';
    });
  }

  // ── Reading progress bar (blog post page)
  const progress = document.getElementById('reading-progress');
  if (progress) {
    window.addEventListener('scroll', () => {
      const article = document.getElementById('article-body');
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const scrolled = Math.max(0, Math.min(100, (-top / (height - window.innerHeight)) * 100));
      progress.style.width = scrolled + '%';
    });
  }

});
