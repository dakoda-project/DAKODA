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

  // ✅ This alias is correct because _includes/layouts is in the root
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");

  const corpora = loadCorpora();

  eleventyConfig.addCollection("corporaPages", function () {
    const seen = new Set();

    return corpora.map(corpus => {
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
    }).filter(Boolean);
  });

  return {
    dir: {
      input: "input",
      includes: "../_includes",           // ✅ FIXED: points outside input/
      layouts: "../_includes/layouts",    // ✅ FIXED: points outside input/
      data: "data",
      output: "_site"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
