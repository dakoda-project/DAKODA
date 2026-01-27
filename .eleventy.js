// .eleventy.js
const fs = require("fs");
const path = require("path");

const loadCorpora = require("./input/_data/corpora.js");

module.exports = function (eleventyConfig) {
  [
    "input/css",
    "input/js",
    "input/data",
    "input/notebooks"
  ].forEach(dir => eleventyConfig.addPassthroughCopy(dir));
  eleventyConfig.addPassthroughCopy({ "input/static/_redirects": "_redirects" });
  
  eleventyConfig.addPassthroughCopy({
    "node_modules/d3/dist/d3.min.js": "vendor/d3.min.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/markmap-lib/dist/browser/index.iife.js": "vendor/markmap-lib.min.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/markmap-view/dist/browser/index.js": "vendor/markmap-view.min.js",
  });

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

  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");

  const corpora = loadCorpora();

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
