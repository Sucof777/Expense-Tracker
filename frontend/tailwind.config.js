/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class", // 👈 omogućimo dark preko .dark klase
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bfe0ff",
          300: "#93c9ff",
          400: "#5ca9ff",
          500: "#2b8bff", // primary
          600: "#1f6fe3",
          700: "#1b5ac0",
          800: "#184c9f",
          900: "#163f82",
        },
        card: {
          DEFAULT: "rgb(255 255 255 / 0.7)",
          dark: "rgb(17 24 39 / 0.6)", // slate-900 w/ opacity
        },
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgb(2 6 23 / 0.2)", // slate-950/20
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
