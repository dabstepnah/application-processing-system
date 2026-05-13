/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        appBg: "#121212",
        appCard: "#181818",
        appHover: "#282828",
        appAccent: "#1DB954",
        textPrimary: "#FFFFFF",
        textSecondary: "#B3B3B3"
      },
      boxShadow: {
        card: "0 12px 32px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};
