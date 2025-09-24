// input/_data/corpora.js
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

/* ----------------------------- small helpers ----------------------------- */
function generateSlug(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

/* -------------------- scan DKD download folder for files ------------------ */
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

/* ------------- load speakers/texts from Excel (robust headers) ------------ */
function loadSpeakersTextsMap() {
  const dataDir = path.join(__dirname, "../data");
  const candidates = [
    path.join(dataDir, "speaker_text_counts_repo.xlsx"),
    path.join(dataDir, "repo_table_layout_new.xlsx"),
  ];
  const file = candidates.find(p => fs.existsSync(p));
  if (!file) return new Map();

  const wb = XLSX.readFile(file);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });

  const norm = s => String(s || "").trim();
  const toSlug = s => norm(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // build lowercase header map
  const headerMap = {};
  if (rows[0]) {
    Object.keys(rows[0]).forEach(h => (headerMap[h.toLowerCase()] = h));
  }

  // choose key header (corpus/signet/slug/name/... or fall back to first column, e.g. "Unnamed: 0")
  const preferredKeyHeaders = [
    "corpus", "signet", "slug", "name", "corpus title", "korpustitel"
  ];
  let keyHeaderLower = preferredKeyHeaders.find(h => headerMap[h]);
  if (!keyHeaderLower) keyHeaderLower = Object.keys(headerMap)[0];
  const keyHeader = headerMap[keyHeaderLower];

  const speakersHeader = headerMap["speakers"] || headerMap["learners"];
  const textsHeader    = headerMap["texts"]    || headerMap["documents"];

  const map = new Map();

  rows.forEach(r => {
    const keyRaw      = keyHeader ? r[keyHeader] : "";
    const speakersRaw = speakersHeader ? r[speakersHeader] : "";
    const textsRaw    = textsHeader    ? r[textsHeader]    : "";

    const speakers = Number(String(speakersRaw).replace(/[^\d.-]/g, "")) || 0;
    const texts    = Number(String(textsRaw).replace(/[^\d.-]/g, "")) || 0;

    const keyName = norm(keyRaw);
    const keySlug = toSlug(keyRaw);
    if (!keyName && !keySlug) return;

    const entry = { speakers, texts };
    if (keySlug) map.set(keySlug, entry);
    if (keyName) map.set(keyName, entry);
  });

  return map;
}

/* --------------------------------- main ----------------------------------- */
module.exports = () => {
  const dataDir = path.join(__dirname, "../data");
  const metaPath = path.join(dataDir, "corpora.json");

  const countsMap = loadSpeakersTextsMap();

  const corpora = [];
  if (fs.existsSync(metaPath)) {
    try {
      const raw = fs.readFileSync(metaPath, "utf-8");
      // corpora.json is an array → wrap to parse safely
      const wrapped = `{ "corpora": ${raw} }`;
      const parsed = JSON.parse(wrapped).corpora;

      for (const meta of parsed) {
        // title from old/new schema
        const title = pick(meta, "corpus_admin_name", "corpus_name");
        if (emptyish(title)) continue;

        const slug = generateSlug(title);
        const signet  = (meta.corpus_subcorpus_signet || "").trim();
        const acronym = (meta.corpus_admin_acronym   || "").trim();

        // availability & SRC (old/new keys)
        const availability = pick(meta, "corpus_admin_availability", "corpus_admin_access");
        const srcUrl       = pick(meta, "corpus_admin_URLdownload", "corpus_admin_url_download");

        // modality can be array in future schema
        let modalityRaw = pick(meta, "task_interaction_mode", "modality");
        let modality = "";
        if (Array.isArray(modalityRaw)) {
          const norm = modalityRaw.map(v => String(v || "").toLowerCase()).filter(Boolean);
          modality = Array.from(new Set(norm)).join("; ");
        } else {
          modality = String(modalityRaw || "");
        }

        // CEFR min/max (fall back to single value)
        let cefrMin = pick(meta, "corpus_proficiency_levelMin", "corpus_proficiency_level_min");
        let cefrMax = pick(meta, "corpus_proficiency_levelMax", "corpus_proficiency_level_max");
        const singleLevel = pick(meta, "corpus_proficiency_level", "corpus_proficiencyLevel");
        if (emptyish(cefrMin) && emptyish(cefrMax) && !emptyish(singleLevel)) {
          const one = pickCEFR(singleLevel);
          cefrMin = one;
          cefrMax = one;
        }

        // sizes from old/new keys (for fallback)
        const sizeTexts    = pick(meta, "corpus_subcorpus_sizeTexts", "corpus_subcorpus_size_texts", "texts");
        const sizeTokens   = pick(meta, "corpus_subcorpus_sizeTokens", "corpus_subcorpus_size_tokens", "tokens");
        const sizeLearners = pick(meta, "corpus_subcorpus_sizeLearners", "corpus_subcorpus_size_learners", "speakers");

        // Speakers / Texts from Excel map (lookup by multiple keys)
        const fromXlsx =
          countsMap.get(signet) ||
          countsMap.get(slug) ||
          countsMap.get(String(title).trim()) ||
          countsMap.get(String(acronym).trim()) ||
          null;

        // prefer Excel; otherwise fall back to JSON numbers (if numeric)
        const speakers_count = fromXlsx
          ? fromXlsx.speakers
          : (Number(sizeLearners) || "");
        const texts_count = fromXlsx
          ? fromXlsx.texts
          : (Number(sizeTexts) || "");

        const speakers_texts =
          speakers_count !== "" || texts_count !== ""
            ? `${speakers_count || 0} / ${texts_count || 0}`
            : "";

        // detect DKD download files in input/data/<folder>
        const downloads = detectDownloads(meta.corpus_name || slug);

        for (const lang of ["de", "en"]) {
          corpora.push({
            title,
            fileSlug: slug,
            language: lang,
            data: {
              // keep original fields visible if templates reference them
              ...meta,

              // normalized/derived values
              language: lang,
              fileSlug: slug,

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

              corpus_proficiency_levelMin: cefrMin || meta.corpus_proficiency_levelMin || "",
              corpus_proficiency_levelMax: cefrMax || meta.corpus_proficiency_levelMax || "",

              // speakers/texts for templates
              speakers_count,
              texts_count,
              speakers_texts,

              // also override old size fields if Excel provided values (or numeric JSON)
              corpus_subcorpus_sizeLearners:
                speakers_count !== "" ? speakers_count : (meta.corpus_subcorpus_sizeLearners || ""),
              corpus_subcorpus_sizeTexts:
                texts_count !== "" ? texts_count : (meta.corpus_subcorpus_sizeTexts || ""),

              // DKD detected files
              ...downloads,
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
