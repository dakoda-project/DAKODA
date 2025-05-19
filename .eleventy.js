const fs = require("fs");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("input/css");
  eleventyConfig.addPassthroughCopy("input/css/img");
  eleventyConfig.addPassthroughCopy("input/js");
  eleventyConfig.addPassthroughCopy("input/data");

  eleventyConfig.addFilter("slugifyCorpus", function(value) {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  });

  eleventyConfig.addLayoutAlias("base", "../_includes/layouts/base.njk");

  let corpora = [];
  try {
    const data = fs.readFileSync("input/data/corpora.json", "utf-8");
    corpora = JSON.parse(data);
  } catch (error) {
    console.error("Error reading corpora.json:", error);
  }

  // ✅ Only this block is modified
  eleventyConfig.addCollection("corporaPages", function() {
    const langs = ["de", "en"];
    return corpora.flatMap(corpus =>
      langs.map(lang => ({
        title: corpus.title,
        fileSlug: corpus.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
        data: { ...corpus, language: lang }
      }))
    );
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
