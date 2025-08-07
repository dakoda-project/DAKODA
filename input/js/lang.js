function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  const path = window.location.pathname;

  // Match: /page.de.html or /page.en.html
  let match = path.match(/^\/([a-z0-9-]+)\.(en|de)\.html$/i);
  if (match) {
    const base = match[1];
    window.location.href = `/${base}.${lang}.html`;
    return;
  }

  // Match: /repository/slug/index.de.html
  match = path.match(/^\/repository\/([a-z0-9-]+)\/index\.(en|de)\.html$/i);
  if (match) {
    const slug = match[1];
    window.location.href = `/repository/${slug}/index.${lang}.html`;
    return;
  }

  // Match: /page.html (no language suffix)
  match = path.match(/^\/([a-z0-9-]+)\.html$/i);
  if (match) {
    const base = match[1];
    window.location.href = `/${base}.${lang}.html`;
    return;
  }

  // Match: /repository/slug/ (maybe missing index.html explicitly)
  match = path.match(/^\/repository\/([a-z0-9-]+)\/?$/i);
  if (match) {
    const slug = match[1];
    window.location.href = `/repository/${slug}/index.${lang}.html`;
    return;
  }

  // Match: / or /index.html (no lang)
  if (path === "/" || path === "/index.html") {
    window.location.href = `/index.${lang}.html`;
    return;
  }

  // Fallback
  window.location.href = `/index.${lang}.html`;
}

// Apply language preference on page load
window.addEventListener("DOMContentLoaded", () => {
  const storedLang = localStorage.getItem("lang") || "de";
  const path = window.location.pathname;

  const alreadyLocalized = /\.(en|de)\.html$/.test(path);

  if (!alreadyLocalized && (path === "/" || path === "/index.html")) {
    window.location.href = `/index.${storedLang}.html`;
  }

  // Highlight current language button
  const activeBtn = document.getElementById(`${storedLang}-btn`);
  if (activeBtn) activeBtn.classList.add("active");
});
