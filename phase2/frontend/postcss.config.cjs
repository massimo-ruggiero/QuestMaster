// postcss.config.js
module.exports = {
  plugins: [
    // qui usiamo il plugin PostCSS di Tailwind
    require('@tailwindcss/postcss'),
    // e poi autoprefixer
    require('autoprefixer'),
  ]
}
