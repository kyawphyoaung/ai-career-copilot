// postcss.config.mjs

const config = {
  plugins: {
    // Use the new, correct package as requested by the error message
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};

export default config;

