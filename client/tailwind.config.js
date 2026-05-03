/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#112031",
        parchment: "#f7f1e3",
        brass: "#a16207",
        teal: {
          DEFAULT: "#0f766e",
          50: "#ecfdf5",
          200: "#99f6e4",
          700: "#0f766e"
        },
        rosewood: {
          DEFAULT: "#7f1d1d"
        }
      },
      boxShadow: {
        panel: "0 18px 40px rgba(17, 32, 49, 0.12)"
      },
      backgroundImage: {
        "library-grid":
          "radial-gradient(circle at 1px 1px, rgba(17, 32, 49, 0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};
