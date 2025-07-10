// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {}, // Correct way to include the Tailwind CSS PostCSS plugin
    autoprefixer: {}, // Essential for adding vendor prefixes for browser compatibility
  },
};