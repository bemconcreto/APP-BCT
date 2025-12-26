import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === IDENTIDADE BEM CONCRETO === */
        primary: "#8D6E63",       // marrom principal
        primaryDark: "#72594F",
        secondary: "#BFA89C",

        background: "#F7F8F9",    // fundo landing
        surface: "#FFFFFF",

        text: "#101820",
        muted: "#6B7280",

        success: "#12B76A",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
} satisfies Config;