import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#F06292",
          light: "#F8BBD9",
          dark: "#E91E8C",
          50: "#FFF0F5",
          100: "#FFD6E7",
          200: "#F8BBD9",
          300: "#F48FB1",
          400: "#F06292",
          500: "#EC407A",
          600: "#E91E63",
          700: "#C2185B",
          800: "#AD1457",
          900: "#880E4F",
        },
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E8D5A3",
          dark: "#A67C52",
          50: "#FDF8F0",
          100: "#F7EDD8",
          200: "#E8D5A3",
          300: "#D4B875",
          400: "#C9A96E",
          500: "#B8922A",
          600: "#A67C52",
          700: "#8B6340",
          800: "#6B4C30",
          900: "#4A3520",
        },
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 40px rgba(240,98,146,0.15)",
        gold: "0 4px 20px rgba(201,169,110,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
