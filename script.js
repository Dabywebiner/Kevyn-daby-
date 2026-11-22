(() => {
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = [...document.querySelectorAll('.page-section')];
  const progress = document.getElementById('progress');

  const D = window.SITE_DATA || { about: [], timeline: [], achievements: [], stats: [] };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  // Contact email
  const mail = document.getElementById('mailLink');
  if (mail && D.email) mail.href = `mailto:${D.email}`;

  // About tabs
  const tabs = document.getElementById('aboutTabs');
  const panel = document.getElementById('aboutPanel');
  function showTab(id) {
    const item = D.about.find(a => a.id === id) || D.about[0];
    if (!item) return;
    [...tabs.children].forEach(b => b.setAttribute('aria-selected', String(b.dataset.id === item.id)));
    panel.replaceChildren();
    panel.append(el('h3', '', item.title));
    item.body.forEach(t => panel.append(el('p', '', t)));
    const chips = el('div', 'chips');
    (item.chips || []).forEach(t => chips.append(el('span', '', t)));
    panel.append(chips);
    panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
  }
  if (tabs && panel) {
    D.about.forEach(a => {
      const b = el('button', 'tab', a.label);
      b.type = 'button'; b.dataset.id = a.id; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => showTab(a.id));
      tabs.append(b);
    });
    showTab(D.about[0] && D.about[0].id);
  }

  // Timeline
  const tl = document.getElementById('timeline');
  if (tl) D.timeline.forEach(t => {
    const a = el('article', 'timeline-item reveal');
    a.append(el('span', 'timeline-dot'), el('p', 'timeline-date', t.date), el('h3', '', t.title), el('p', '', t.text));
    tl.append(a);
  });

  // Stats (count-up)
  const stats = document.getElementById('stats');
  if (stats) D.stats.forEach(s => {
    const val = s.value === 'auto' ? D.achievements.length : s.value;
    const box = el('div', 'stat');
    const num = el('b', '', s.text || '0');
    box.append(num, el('span', '', s.label.toUpperCase()));
    stats.append(box);
    if (!s.text) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { num.textContent = val; return; }
      const t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / 900, 1);
        num.textContent = Math.round(val * p);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
  });

  // Achievements + filters
  const grid = document.getElementById('achGrid');
  const filters = document.getElementById('filters');
  if (grid && filters) {
    D.achievements.forEach((a, i) => {
      const c = el('article', 'ach-card'); c.dataset.cat = a.category; c.style.animationDelay = `${i * 40}ms`;
      const meta = el('div', 'ach-meta'); meta.append(el('b', '', a.category.toUpperCase()), el('span', '', a.year));
      c.append(meta, el('h3', '', a.title), el('p', '', a.text));
      grid.append(c);
    });
    const cats = ['All', ...new Set(D.achievements.map(a => a.category))];
    cats.forEach((cat, i) => {
      const b = el('button', 'tab', cat); b.type = 'button';
      b.setAttribute('aria-pressed', String(i === 0));
      b.addEventListener('click', () => {
        [...filters.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        [...grid.children].forEach(c => { c.hidden = cat !== 'All' && c.dataset.cat !== cat; });
      });
      filters.append(b);
    });
  }

  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
  });

  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  } else {
    // Very old browsers: just show everything.
    reveals.forEach(el => el.classList.add('visible'));
  }

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${amount}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
