/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0b1329',
          card: '#1c2541',
          accent: '#3a506b',
          glow: '#5bc0be',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
          indigo: '#6366f1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-emerald': '0 0 10px rgba(16, 185, 129, 0.4)',
        'neon-amber': '0 0 10px rgba(245, 158, 11, 0.4)',
        'neon-crimson': '0 0 10px rgba(239, 68, 68, 0.4)',
        'neon-indigo': '0 0 10px rgba(99, 102, 241, 0.4)',
        'neon-glow': '0 0 15px rgba(91, 192, 190, 0.5)',
      }
    },
  },
  plugins: [],
}
