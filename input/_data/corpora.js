// input/_data/corpora.js
const fs = require("fs");
const path = require("path");

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- NEW helpers (for XML schema compatibility) -----------------
function emptyish(v) {
  if (v === null || v === undefined) return true;
  const s = String(v).trim();
  return (
    !s ||
    /^jr$/i.test(s) ||
    /^not\s*available$/i.test(s) ||
    s === "#" ||
    s.toLowerCase() === "null"
  );
}
function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj && !emptyish(obj[k])) return obj[k];
  }
  return undefined;
}
function pickCEFR(val) {
  if (emptyish(val)) return undefined;
  const m = String(val).toUpperCase().match(/A1|A2|B1|B2|C1|C2/);
  return m ? m[0] : undefined;
}
// ----------------------------------------------------------------

// ✅ Add this helper to check the folder for download files
function detectDownloads(corpusFolderName) {
  const folderPath = path.join(__dirname, "../data", corpusFolderName);
  const result = {
    cas_data: "",
    plain_text: "",
    metadata_csv: "",
    source_format: ""
  };

  if (!fs.existsSync(folderPath)) return result;

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const lower = file.toLowerCase();
    if (lower.endsWith(".xmi.zip")) result.cas_data = file;
    else if (lower.endsWith(".txt.zip")) result.plain_text = file;
    else if (lower.endsWith(".csv") || lower.endsWith(".xlsx")) result.metadata_csv = file;
    else if (lower.endsWith(".xml") || lower.endsWith(".json")) result.source_format = file;
  }

  return result;
}

module.exports = () => {
  const dataDir = path.join(__dirname, "../data");
  const metaPath = path.join(dataDir, "corpora.json");

  let corpora = [];

  if (fs.existsSync(metaPath)) {
    try {
      const raw = fs.readFileSync(metaPath, "utf-8");
      const wrapped = `{ "corpora": ${raw} }`;
      const parsed = JSON.parse(wrapped).corpora;

      for (const meta of parsed) {
        // --- CHANGED: title can be corpus_admin_name (old) or corpus_name (new)
        const title = pick(meta, "corpus_admin_name", "corpus_name");
        if (emptyish(title)) continue;

        const slug = generateSlug(title);

        // --- NEW: normalize availability and SRC link for new schema keys
        const availability = pick(meta, "corpus_admin_availability", "corpus_admin_access");
        const srcUrl = pick(meta, "corpus_admin_URLdownload", "corpus_admin_url_download");

        // --- NEW: support list modality in new schema; join if array
        let modalityRaw = pick(meta, "task_interaction_mode", "modality");
        let modality = "";
        if (Array.isArray(modalityRaw)) {
          const norm = modalityRaw
            .map(v => String(v || "").toLowerCase())
            .filter(Boolean);
          modality = Array.from(new Set(norm)).join("; ");
        } else {
          modality = String(modalityRaw || "");
        }

        // --- NEW: CEFR min/max fallback from single level
        let cefrMin = pick(meta, "corpus_proficiency_levelMin", "corpus_proficiency_level_min");
        let cefrMax = pick(meta, "corpus_proficiency_levelMax", "corpus_proficiency_level_max");
        const singleLevel = pick(meta, "corpus_proficiency_level", "corpus_proficiencyLevel");
        if (emptyish(cefrMin) && emptyish(cefrMax) && !emptyish(singleLevel)) {
          const one = pickCEFR(singleLevel);
          cefrMin = one;
          cefrMax = one;
        }

        // --- NEW: sizes under old/new keys (used for "Speakers / texts")
        const sizeTexts    = pick(meta, "corpus_subcorpus_sizeTexts", "corpus_subcorpus_size_texts", "texts");
        const sizeTokens   = pick(meta, "corpus_subcorpus_sizeTokens", "corpus_subcorpus_size_tokens", "tokens");
        const sizeLearners = pick(meta, "corpus_subcorpus_sizeLearners", "corpus_subcorpus_size_learners", "speakers");

        // keep your old fields too, but prefer normalized ones above
        for (const lang of ["de", "en"]) {
          corpora.push({
            title,
            fileSlug: slug,
            language: lang,
            data: {
              ...meta,                      // keep original fields available
              language: lang,
              fileSlug: slug,

              // your existing derived fields (preserve names)
              modality: modality || "",
              task_type: meta.task_type || "",
              size_texts: sizeTexts || "",
              size_in_tokens: sizeTokens || "",
              num_learners: sizeLearners || "",
              proficiency: pick(meta, "corpus_proficiency_levelMax", "corpus_proficiency_level_max") || "",
              pt_stages_observed: meta.pt_stages_observed || "",
              access: availability || "",
              source: srcUrl || "",
              pid: pick(meta, "corpus_admin_pid_dkd", "corpus_admin_pid") || "",
              unique_handle: pick(meta, "corpus_admin_URLquery", "corpus_admin_url_query") || "",
              version: pick(meta, "corpus_admin_version_orig", "corpus_admin_version") || "",

              // ensure templates always have these (even if only single level is present)
              corpus_proficiency_levelMin: cefrMin || meta.corpus_proficiency_levelMin || "",
              corpus_proficiency_levelMax: cefrMax || meta.corpus_proficiency_levelMax || "",

              // keep original download detection
              ...detectDownloads(meta.corpus_name || slug)  // ✅ Inject detected downloads
            }
          });
        }
      }
    } catch (err) {
      console.error("Error parsing corpora.json:", err.message);
    }
  }

  return corpora;
};
