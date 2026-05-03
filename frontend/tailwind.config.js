/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0f0f",
          900: "#101918",
          800: "#172221"
        },
        brass: {
          500: "#c89b3c",
          400: "#d8ad4a",
          200: "#f0d89f"
        },
        moss: {
          500: "#3a6c56",
          300: "#8fb5a2"
        },
        clay: {
          500: "#b85c38",
          300: "#d7977c"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        display: ['"Aptos Display"', '"Segoe UI Variable Display"', "sans-serif"],
        body: ['"Aptos"', '"Segoe UI Variable Text"', "sans-serif"]
      }
    }
  },
  plugins: []
};

