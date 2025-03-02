module.exports = function(eleventyConfig) {
    // Copy CSS files to the output directory
    eleventyConfig.addPassthroughCopy("input/css");

    return {
        dir: {
            input: "input",
            includes: "../_includes",  // Corrected path (not inside "input")
            layouts: "../_includes/layouts", // Ensures layouts are found
            output: "_site"
        }
    };
};
