// assets/js/table.js
(function (win, doc) {
  const CEFR = ['A1','A2','B1','B2','C1','C2'];

  function idx(val) {
    if (!val) return -1;
    const m = String(val).match(/(A1|A2|B1|B2|C1|C2)/i);
    return m ? CEFR.indexOf(m[1].toUpperCase()) : -1;
  }

  function areFiltersDefault() {
    const access   = (doc.getElementById("accessFilter")?.value || "all").toLowerCase();
    const l1       = (doc.getElementById("l1Filter")?.value || "all").toLowerCase();
    const modality = (doc.getElementById("modalityFilter")?.value || "all").toLowerCase();
    const gerMin   = (doc.getElementById("gerMinFilter")?.value || "all").toUpperCase();
    const gerMax   = (doc.getElementById("gerMaxFilter")?.value || "all").toUpperCase();
    return access === "all" && l1 === "all" && modality === "all" && gerMin === "ALL" && gerMax === "ALL";
  }

  function updateResetDisabled() {
    const btn = doc.getElementById("resetFiltersBtn");
    if (btn) btn.disabled = areFiltersDefault();
  }

  function applyFilters() {
    const access   = (doc.getElementById("accessFilter")?.value || "all").toLowerCase();
    const l1       = (doc.getElementById("l1Filter")?.value || "all").toLowerCase();
    const modality = (doc.getElementById("modalityFilter")?.value || "all").toLowerCase();
    const gerMin   = (doc.getElementById("gerMinFilter")?.value || "all").toUpperCase();
    const gerMax   = (doc.getElementById("gerMaxFilter")?.value || "all").toUpperCase();

    let minBound = gerMin === 'ALL' ? -Infinity : CEFR.indexOf(gerMin);
    let maxBound = gerMax === 'ALL' ?  Infinity : CEFR.indexOf(gerMax);
    if (Number.isFinite(minBound) && Number.isFinite(maxBound) && minBound > maxBound) {
      const t = minBound; minBound = maxBound; maxBound = t;
    }

    const rows = doc.querySelectorAll("#repo-body tr");
    rows.forEach(row => {
      const rAccess = (row.dataset.availability || "").toLowerCase();
      const rL1     = (row.dataset.l1type || "").toLowerCase();
      const rMod    = (row.dataset.modality || "").toLowerCase();

      const rMinIdx = idx(row.dataset.cefrMin);
      const rMaxIdx = idx(row.dataset.cefrMax);

      const accOK = access === "all" || rAccess === access;
      const l1OK  = l1 === "all" || rL1 === l1;
      const modOK = modality === "all" || rMod === modality;

      const anyGerSelected = (gerMin !== 'ALL') || (gerMax !== 'ALL');
      let gerOK = true;
      if (anyGerSelected) {
        if (rMinIdx === -1 && rMaxIdx === -1) {
          gerOK = false;
        } else {
          const rowMin = (rMinIdx === -1) ? -Infinity : rMinIdx;
          const rowMax = (rMaxIdx === -1) ?  Infinity : rMaxIdx;
          gerOK = rowMin >= minBound && rowMax <= maxBound;
        }
      }

      row.style.display = (accOK && l1OK && modOK && gerOK) ? "" : "none";
    });

    updateResetDisabled();
  }

  function resetFilters() {
    ["accessFilter","l1Filter","modalityFilter","gerMinFilter","gerMaxFilter"].forEach(id => {
      const el = doc.getElementById(id);
      if (el) el.value = "all";
    });
    applyFilters();
    if (typeof win.resetRepoSorting === 'function') win.resetRepoSorting();
  }

  function attachFilterEvents() {
    ["accessFilter","l1Filter","modalityFilter","gerMinFilter","gerMaxFilter"].forEach(id => {
      const el = doc.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });
    const btn = doc.getElementById("resetFiltersBtn");
    if (btn) btn.addEventListener('click', resetFilters);
  }

  function attachSorting() {
    const tbody = doc.getElementById('repo-body');
    if (!tbody) return;

    const ORDER = {
      availability: ['open', 'closed', 'restricted', 'special restrictions'],
      l1type: ['mono', 'multi'],
      modality: ['written', 'spoken', 'spoken; written'],
      cefr: ['A1','A2','B1','B2','C1','C2']
    };

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach((r, i) => { if (!r.dataset.index) r.dataset.index = i; });

    const ths = doc.querySelectorAll('th.sortable');

    ths.forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sortKey;
        const isAsc  = th.classList.contains('asc');
        const isDesc = th.classList.contains('desc');

        ths.forEach(t => t.classList.remove('asc','desc'));

        if (!isAsc && !isDesc) {
          th.classList.add('asc');
          sortAndRender(key, 'asc');
        } else if (isAsc) {
          th.classList.add('desc');
          sortAndRender(key, 'desc');
        } else {
          resetSorting();
          return;
        }

        updateIcons();
      });
    });

    function updateIcons() {
      ths.forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (!icon) return;
        if (th.classList.contains('asc')) icon.textContent = '▲';
        else if (th.classList.contains('desc')) icon.textContent = '▼';
        else icon.textContent = '↕';
      });
    }

    function sortAndRender(key, dir) {
      const sorted = rows.slice().sort((a, b) => cmp(a, b, key, dir));
      sorted.forEach(r => tbody.appendChild(r));
    }

    function cmp(a, b, key, dir) {
      let c = 0;
      switch (key) {
        case 'title': {
          const av = (a.dataset.acronym || a.dataset.title || '').toLowerCase();
          const bv = (b.dataset.acronym || b.dataset.title || '').toLowerCase();
          c = av.localeCompare(bv, undefined, {sensitivity:'base'});
          break;
        }
        case 'availability':
          c = orderCompare(a.dataset.availability, b.dataset.availability, ORDER.availability);
          break;
        case 'l1type':
          c = orderCompare(a.dataset.l1type, b.dataset.l1type, ORDER.l1type);
          break;
        case 'modality':
          c = orderCompare(a.dataset.modality, b.dataset.modality, ORDER.modality);
          break;
        case 'cefr-min':
          c = cefrCompare(a.dataset.cefrMin, b.dataset.cefrMin);
          break;
        case 'cefr-max':
          c = cefrCompare(a.dataset.cefrMax, b.dataset.cefrMax);
          break;
        default: {
          const av = (a.dataset.title || '').toLowerCase();
          const bv = (b.dataset.title || '').toLowerCase();
          c = av.localeCompare(bv, undefined, {sensitivity:'base'});
        }
      }
      return dir === 'asc' ? c : -c;
    }

    function orderCompare(a, b, order) {
      const ai = orderIndex(a, order), bi = orderIndex(b, order);
      return ai - bi;
    }
    function orderIndex(v, order) {
      v = (v || '').toLowerCase().trim();
      const i = order.indexOf(v);
      return i === -1 ? Number.POSITIVE_INFINITY : i;
    }
    function cefrCompare(a, b) {
      const ai = CEFR.indexOf((a||'').toUpperCase().trim());
      const bi = CEFR.indexOf((b||'').toUpperCase().trim());
      return (ai === -1 ? Number.POSITIVE_INFINITY : ai) - (bi === -1 ? Number.POSITIVE_INFINITY : bi);
    }

    function resetSorting() {
      const restored = rows.slice().sort((a,b) => (+a.dataset.index) - (+b.dataset.index));
      restored.forEach(r => tbody.appendChild(r));
      ths.forEach(th => {
        th.classList.remove('asc','desc');
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.textContent = '↕';
      });
    }

    // Exporte für externen Reset (z. B. beim Filter-Reset)
    win.resetRepoSorting = resetSorting;
    updateIcons();
  }

  function initRepoTable() {
    attachFilterEvents();
    attachSorting();
    // Initial anwenden
    applyFilters();
  }

  // Public API
  win.DAKODA = win.DAKODA || {};
  win.DAKODA.table = { initRepoTable, applyFilters, resetFilters };
})(window, document);