/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        prism: {
          bg: "#07070D",
          dark: "#0B0C16",
          card: "#121324",
          cardHover: "#171930",
          border: "#262846",
          purple: {
            DEFAULT: "#8B5CF6",
            light: "#A78BFA",
            dark: "#6D28D9",
            glow: "rgba(139, 92, 246, 0.4)"
          },
          blue: {
            DEFAULT: "#3B82F6",
            electric: "#60A5FA"
          }
        }
      },
      boxShadow: {
        'prism-glow': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'prism-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'prism-neon': '0 0 15px rgba(168, 85, 247, 0.5), inset 0 0 15px rgba(168, 85, 247, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
