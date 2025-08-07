// input/_data/corpora.js
const fs = require("fs");
const path = require("path");

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
        if (!meta.corpus_admin_name) continue;

        const title = meta.corpus_admin_name;
        const slug = generateSlug(title);

        for (const lang of ["de", "en"]) {
          corpora.push({
            title,
            fileSlug: slug,
            language: lang,
            data: {
              ...meta,
              language: lang,
              fileSlug: slug,
              modality: meta.task_interaction_mode || "",
              task_type: meta.task_type || "",
              size_texts: meta.corpus_subcorpus_sizeTexts || "",
              size_in_tokens: meta.corpus_subcorpus_sizeTokens || "",
              num_learners: meta.corpus_subcorpus_sizeLearners || "",
              proficiency: meta.corpus_proficiency_levelMax || "",
              pt_stages_observed: meta.pt_stages_observed || "",
              access: meta.corpus_admin_availability || "",
              source: meta.corpus_admin_URLdownload || "",
              pid: meta.corpus_admin_pid_dkd || "",
              unique_handle: meta.corpus_admin_URLquery || "",
              version: meta.corpus_admin_version_orig || "",
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
