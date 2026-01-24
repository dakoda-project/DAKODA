// input/_data/corpora.js
const fs = require("fs");
const path = require("path");

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
  return !s || /^jr$/i.test(s) || /^not\s*available$/i.test(s) || s === "#" || s.toLowerCase() === "null";
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
 
/* -------------------- detect downloads & build URLs ---------------------- */
function detectDownloads(meta, fileSlug) {
  const availabilityRaw = String(pick(meta, "corpus_admin_availability", "corpus_admin_access") || "")
    .toLowerCase().trim();
  const availabilityDir = availabilityRaw === "special restrictions" ? "restricted" : availabilityRaw;
  
  // Use corpus_subcorpus_signet (matches folder names), fallback to acronym then slug
  const id = String(pick(meta, "corpus_subcorpus_signet", "corpus_admin_acronym") || "").trim() || fileSlug;
  
  // Check if folder exists in repo
  const folderPath = path.join(__dirname, "../data/repo", availabilityDir, id);
  const folderExists = fs.existsSync(folderPath);
  
  // Return empty if folder doesn't exist
  if (!folderExists) {
    return {
      downloads: [],
      downloads_folder: "",
      downloads_base_url: ""
    };
  }
  
  // Base download path
  const downloadPath = `/data/repo/${availabilityDir}/${id}`;
  
  // Build array of available formats
  const downloads = [];
  const formats = [
    { ext: "_xmi.zip", label: "xmi" },
    { ext: "_txt.zip", label: "txt" },
    { ext: ".xml", label: "xml" },
    { ext: ".json", label: "json" }
  ];
  
  for (const fmt of formats) {
    const fileName = `${id}${fmt.ext}`;
    const filePath = path.join(folderPath, fileName);
    if (fs.existsSync(filePath)) {
      downloads.push({
        format: fmt.label,
        url: `${downloadPath}/${fileName}`,
        fileName: fileName,
        type: "download"
      });
    }
  }
  
  // Add source link if available
  const srcUrl = pick(meta, "corpus_admin_URLdownload", "corpus_admin_url_download");
  if (!emptyish(srcUrl)) {
    downloads.push({
      format: "Source",
      url: srcUrl,
      type: "source",
      external: true
    });
  }
  
  return {
    downloads: downloads,
    downloads_folder: id,
    downloads_base_url: downloadPath
  };
}

/* ------------- load speakers/texts from JSON (robust headers) ------------- */
function loadSpeakersTextsMap() {
  const dataDir = path.join(__dirname, "../data");
  const candidates = [
    path.join(dataDir, "speaker_text_counts_repo.json"),
    path.join(dataDir, "speakers_texts.json"),
  ];
  const file = candidates.find(p => fs.existsSync(p));
  if (!file) return new Map();

  let rows = [];
  try {
    const raw = fs.readFileSync(file, "utf-8");
    rows = JSON.parse(raw);
  } catch {
    return new Map();
  }

  const norm = s => String(s || "").trim();
  const lower = s => norm(s).toLowerCase();
  const toSlug = s => generateSlug(s);

  // Lowercase header map
  const headerMap = {};
  if (rows[0]) {
    Object.keys(rows[0]).forEach(h => (headerMap[h.toLowerCase()] = h));
  }

  // Choose key column (fallback to first)
  const preferredKeyHeaders = ["corpus","signet","slug","name","corpus title","korpustitel","acronym","kurzname"];
  let keyHeaderLower = preferredKeyHeaders.find(h => headerMap[h]);
  if (!keyHeaderLower) keyHeaderLower = Object.keys(headerMap)[0];
  const keyHeader = headerMap[keyHeaderLower];

  const speakersHeader = headerMap["speakers"] || headerMap["learners"] || headerMap["sprecher"];
  const textsHeader    = headerMap["texts"]    || headerMap["documents"] || headerMap["texte"];

  const map = new Map();

  rows.forEach(r => {
    const keyRaw      = keyHeader ? r[keyHeader] : "";
    const speakersRaw = speakersHeader ? r[speakersHeader] : "";
    const textsRaw    = textsHeader    ? r[textsHeader]    : "";

    // Allow numeric or numeric-like strings; ignore commas/spaces
    const speakers = Number(String(speakersRaw).replace(/[^\d.-]/g, "")) || 0;
    const texts    = Number(String(textsRaw).replace(/[^\d.-]/g, "")) || 0;

    const keyNameLower = lower(keyRaw);
    const keySlug      = toSlug(keyRaw);

    if (!keyNameLower && !keySlug) return;

    const entry = { speakers, texts };

    // Store two keys so we can match by either name (case-insensitive) or slug later
    if (keyNameLower) map.set(`name:${keyNameLower}`, entry);
    if (keySlug)      map.set(`slug:${keySlug}`, entry);
  });

  return map;
}

/* --------- try many ways to find a speakers/texts hit for a corpus -------- */
function lookupCounts(countsMap, meta, fallbackTitle, fallbackSlug) {
  const norm = s => String(s || "").trim();
  const lower = s => norm(s).toLowerCase();
  const slug = s => generateSlug(s);

  const signet   = norm(meta.corpus_subcorpus_signet);
  const acronym  = norm(meta.corpus_admin_acronym);
  const title    = norm(fallbackTitle);
  const cname    = norm(meta.corpus_name);

  const candidates = [
    `name:${lower(signet)}`,   `slug:${slug(signet)}`,
    `name:${lower(acronym)}`,  `slug:${slug(acronym)}`,
    `name:${lower(title)}`,    `slug:${fallbackSlug}`,
    `name:${lower(cname)}`,    `slug:${slug(cname)}`
  ];

  for (const key of candidates) {
    if (countsMap.has(key)) return countsMap.get(key);
  }
  return null;
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
      const wrapped = `{ "corpora": ${raw} }`;
      const parsed = JSON.parse(wrapped).corpora;

      for (const meta of parsed) {
        // title from old/new schema
        const title = meta["corpus_name"];
        if (emptyish(title)) continue;

        const slug = generateSlug(title);

        // availability & SRC (old/new keys)
        const availability = pick(meta, "corpus_admin_availability", "corpus_admin_access");
        const srcUrl       = pick(meta, "corpus_admin_URLdownload", "corpus_admin_url_download");

        // modality can be array in future schema
        let modalityRaw = pick(meta, "task_interaction_mode", "modality");
        let modality = "";
        if (Array.isArray(modalityRaw)) {
          const normVals = modalityRaw.map(v => String(v || "").toLowerCase()).filter(Boolean);
          modality = Array.from(new Set(normVals)).join("; ");
        } else {
          modality = String(modalityRaw || "");
        }

        // CEFR min/max (fall back to single value)
        let cefrMin = pick(meta, "corpus_proficiency_levelMin", "corpus_proficiency_level_min");
        let cefrMax = pick(meta, "corpus_proficiency_levelMax", "corpus_proficiency_level_max");
        const singleLevel = pick(meta, "corpus_proficiency_level", "corpus_proficiencyLevel");
        if (emptyish(cefrMin) && emptyish(cefrMax) && !emptyish(singleLevel)) {
          const one = pickCEFR(singleLevel);
          cefrMin = one; cefrMax = one;
        }

        // sizes from old/new keys (still exposed)
        const sizeTexts    = pick(meta, "corpus_subcorpus_sizeTexts", "corpus_subcorpus_size_texts", "texts");
        const sizeTokens   = pick(meta, "corpus_subcorpus_sizeTokens", "corpus_subcorpus_size_tokens", "tokens");
        const sizeLearners = pick(meta, "corpus_subcorpus_sizeLearners", "corpus_subcorpus_size_learners", "speakers");

        // Speakers / Texts from JSON map (robust lookup)
        const hit = lookupCounts(countsMap, meta, title, slug);
        const speakers_count = hit ? hit.speakers : "";
        const texts_count    = hit ? hit.texts    : "";
        const speakers_texts = hit ? `${speakers_count || 0} / ${texts_count || 0}` : "";

        // detect DKD download files (repo layout + fallbacks)
        const downloads = detectDownloads(meta, slug);
 
         for (const lang of ["de", "en"]) {
           corpora.push({
             title,
             fileSlug: slug,
             language: lang,
             data: {
               ...meta, // keep original fields for templates

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

               // also overwrite old-size fields if JSON provided values (so existing template block works)
               corpus_subcorpus_sizeLearners: !emptyish(speakers_count)
                 ? speakers_count
                 : (meta.corpus_subcorpus_sizeLearners || ""),
               corpus_subcorpus_sizeTexts: !emptyish(texts_count)
                 ? texts_count
                 : (meta.corpus_subcorpus_sizeTexts || ""),

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
