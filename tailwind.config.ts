// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  // <<<<<<< Dark Mode ကို class အလိုက် ထိန်းချုပ်ရန် >>>>>>>>>
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  // <<<<<<< PDF Error ဖြေရှင်းရန် အဓိက အပိုင်း >>>>>>>>>
  future: {
    // Disable the oklch color format that html2canvas does not support yet
    oklch: false,
  },
  plugins: [],
};

export default config;

