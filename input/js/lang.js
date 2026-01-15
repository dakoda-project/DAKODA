// Single source of truth
const LANG_KEY = 'lang';
const DEFAULT_LANG = 'de';
const SUPPORTED = ['de', 'en'];

function getLangFromPath(path = window.location.pathname) {
  const m = path.match(/\.(en|de)\.html$/i);
  return m ? m[1].toLowerCase() : null;
}

function resolveLangUrl(lang, path = window.location.pathname) {
  const search = window.location.search || '';
  const hash   = window.location.hash   || '';

  // 1) /page.en.html → replace locale
  let m = path.match(/^\/([^/]+)\.(en|de)\.html$/i);
  if (m) {
    const base = m[1];
    return `/${base}.${lang}.html${search}${hash}`;
  }

  // 2) /repository/slug/index.en.html → replace locale
  m = path.match(/^\/repository\/([a-z0-9-]+)\/index\.(en|de)\.html$/i);
  if (m) {
    const slug = m[1];
    return `/repository/${slug}/index.${lang}.html${search}${hash}`;
  }

  // 3) /page.html (no locale) → insert locale
  m = path.match(/^\/([^/]+)\.html$/i);
  if (m) {
    const base = m[1];
    return `/${base}.${lang}.html${search}${hash}`;
  }

  // 4) /repository/slug[/] → index.lang.html
  m = path.match(/^\/repository\/([a-z0-9-]+)\/?$/i);
  if (m) {
    const slug = m[1];
    return `/repository/${slug}/index.${lang}.html${search}${hash}`;
  }

  // 5) Root: / or /index.html → index.lang.html
  if (path === '/' || path === '/index.html') {
    return `/index.${lang}.html${search}${hash}`;
  }

  // Fallback
  return `/index.${lang}.html${search}${hash}`;
}

function setLanguage(lang) {
  if (!SUPPORTED.includes(lang)) return;
  localStorage.setItem(LANG_KEY, lang);
  // Avoid adding a new entry to history
  window.location.replace(resolveLangUrl(lang));
}

function applyActiveLangUI(lang) {
  document.querySelectorAll('.lang-toggle').forEach(group => {
    group.querySelectorAll('.lang-btn').forEach(btn => {
      const pressed = btn.dataset.lang === lang;
      btn.classList.toggle('active', pressed);
      btn.setAttribute('aria-pressed', String(pressed));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const urlLang = getLangFromPath();
  const storedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  const currentLang = urlLang || storedLang;

  // If homepage without locale, redirect to stored (or default) locale
  if (!urlLang && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
    window.location.replace(`/index.${currentLang}.html${window.location.search || ''}${window.location.hash || ''}`);
    return; // avoid running UI code before redirect
  }

  // Ensure storage reflects the current page language
  localStorage.setItem(LANG_KEY, currentLang);

  // Highlight buttons to match the current language
  applyActiveLangUI(currentLang);
});

// Click to switch language (buttons)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;

  const lang = (btn.dataset.lang || '').toLowerCase();
  if (!SUPPORTED.includes(lang)) return;

  const currentLang = getLangFromPath() || localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  if (lang === currentLang) return; // already on that language

  setLanguage(lang);
});