import type { Config } from "tailwindcss";

// Tailwind v4: most configuration is done via CSS @theme in globals.css
// This file is kept for compatibility and content scanning
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
