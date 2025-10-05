// postcss.config.mjs

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Correctly reference the new Tailwind CSS v4 PostCSS plugin
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;

