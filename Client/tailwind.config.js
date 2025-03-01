/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkPrimary: "#15173C",
        darkSecondary: "#032455",
      }
    },
  },
  plugins: [require("tailwind-scrollbar")],
}

