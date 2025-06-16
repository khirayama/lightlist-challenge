const baseConfig = require('@hobby-baseline/styles/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  plugins: [],
};