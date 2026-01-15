// assets/js/ui.js
(function (win, doc) {
  function initAnimations() {
    const els = doc.querySelectorAll('.fade-in');
    if (!els.length) return;

    // Motion-Reduktion oder fehlender IO → alles sofort sichtbar
    const reduceMotion = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in win)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target); // nach dem ersten Sichtbarwerden abmelden
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px', // triggert etwas vor dem Viewport-Ende
      threshold: 0.1
    });

    els.forEach(el => observer.observe(el));
  }

  function initScrollToTop() {
    const btn = doc.getElementById('scrollTopBtn');
    if (!btn) return;

    const onScroll = () => {
      const y = win.scrollY || doc.documentElement.scrollTop || doc.body.scrollTop || 0;
      btn.hidden = !(y > 200); // semantisch: aus dem a11y-Tree entfernen
    };

    win.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', () => {
      const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        win.scrollTo(0, 0);
      } else {
        win.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    onScroll(); // initialer Zustand
  }

  function initSidebarToggle() {
    const sidebar = doc.querySelector('.sidebar');
    const toggleBtn = doc.getElementById('toggleSidebar');
    if (!sidebar || !toggleBtn) return;

    // Optional: Icon rein visuell, zugänglicher Name bleibt stabil (via aria-label im Markup)
    function updateA11y() {
      const collapsed = sidebar.classList.contains('collapsed');
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
      // Symbol nur visuell (nicht zwingend nötig wenn CSS-Icon):
      toggleBtn.textContent = collapsed ? '⯈' : '⇤';
    }

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      updateA11y();
    });

    updateA11y();
  }

  function init() {
    initAnimations();
    initScrollToTop();
    initSidebarToggle();
  }

  // Namespace
  win.DAKODA = win.DAKODA || {};
  win.DAKODA.ui = { init };
})(window, document);