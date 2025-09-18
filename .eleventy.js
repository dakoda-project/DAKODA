// .eleventy.js
const fs = require("fs");
const path = require("path");

const loadCorpora = require("./input/_data/corpora.js");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("input/css");
  eleventyConfig.addPassthroughCopy("input/css/img");
  eleventyConfig.addPassthroughCopy("input/js");
  eleventyConfig.addPassthroughCopy("input/data");
  eleventyConfig.addPassthroughCopy({ "input/static/_redirects": "_redirects" });

  eleventyConfig.addFilter("slugifyCorpus", function (value) {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  });

  eleventyConfig.addFilter("truncateTitle", function (str, maxLength = 35) {
    if (!str || str.length <= maxLength) return str;
    const trimmed = str.slice(0, maxLength);
    const clean = trimmed.replace(/\s+\S*$/, "");
    return clean + "...";
  });

  // NEW: jrLabel -> show "Not available" for placeholder values (used in templates)
  eleventyConfig.addFilter("jrLabel", function (value) {
    const v = (value ?? "").toString().trim();
    if (
      !v ||
      v === "#" ||
      /^jr\b/i.test(v) ||
      /^jr\s*:/i.test(v) ||
      /^not\s*available$/i.test(v) ||
      v.toLowerCase() === "null"
    ) {
      return "Not available";
    }
    return v;
  });

  // NEW: show "Not available" for placeholder values like JR/#/null
  eleventyConfig.addFilter("cleanJR", function (val) {
    if (val === null || val === undefined) return "Not available";
    const s = String(val).trim();
    if (
      !s ||
      /^jr$/i.test(s) ||
      /^not\s*available$/i.test(s) ||
      s === "#" ||
      s.toLowerCase() === "null"
    ) {
      return "Not available";
    }
    return s;
  });

  // NEW: blank out placeholder values when used in data-* attributes
  eleventyConfig.addFilter("emptyIfJR", function (val) {
    if (val === null || val === undefined) return "";
    const s = String(val).trim();
    if (
      !s ||
      /^jr$/i.test(s) ||
      /^not\s*available$/i.test(s) ||
      s === "#" ||
      s.toLowerCase() === "null"
    ) {
      return "";
    }
    return s;
  });

  // ✅ This alias is correct because _includes/layouts is in the root
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");

  const corpora = loadCorpora();

  // UPDATED: keep all rows; no JR filtering here
  eleventyConfig.addCollection("corporaPages", function () {
    const seen = new Set();

    return corpora
      .map(corpus => {
        const lang = corpus.data.language;
        const fileSlug = corpus.fileSlug;
        const key = `${fileSlug}--${lang}`;

        if (seen.has(key)) return null;
        seen.add(key);

        return {
          title: corpus.title,
          fileSlug,
          data: corpus.data
        };
      })
      .filter(Boolean);
  });

  return {
    dir: {
      input: "input",
      includes: "../_includes",
      layouts: "../_includes/layouts",
      data: "data",
      output: "_site"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
