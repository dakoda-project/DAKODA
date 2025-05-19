function setLanguage(lang) {
  localStorage.setItem("lang", lang);

  const path = window.location.pathname;

  // Extract base name (e.g. index, docs)
  const match = path.match(/\/?([a-z-]+)(?:\.(en|de))?\.html$/i);
  const page = match ? match[1] : "index";

  const newPath = `/${page}.${lang}.html`;

  if (!path.endsWith(`.${lang}.html`)) {
    window.location.href = newPath;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const storedLang = localStorage.getItem("lang") || "de";
  const path = window.location.pathname;

  const isExplicit = /\.(en|de)\.html$/.test(path);

  if (!isExplicit) {
    const base = path.replace(/\/$/, "").split("/").pop() || "index";
    window.location.href = `/${base}.${storedLang}.html`;
  }

  const btn = document.getElementById(`${storedLang}-btn`);
  if (btn) btn.classList.add("active");
});
