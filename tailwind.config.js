/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bc_dark: "#101820",      // fundo premium
        bc_brown: "#56423b",     // marrom principal
        bc_brown2: "#4c3b34",    // marrom secundário
        bc_beige: "#e8e3dd",     // fundo claro elegante
        bc_white: "#ffffff",
      },
    },
  },
  plugins: [],
};