// /js/theme.js
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle-theme");
  const body = document.body;

  // Set initial mode from localStorage
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    toggle.checked = true;
  }

  toggle.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });
});
