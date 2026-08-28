/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          darkest: '#090a0f',
          darker: '#11131a',
          dark: '#1a1d27',
          panel: '#222634',
          border: '#363d52',
          gold: '#f59e0b',
          crimson: '#dc2626',
          mana: '#3b82f6',
          poison: '#10b981',
          shadow: '#8b5cf6',
          bone: '#e2e8f0',
          amber: '#fbbf24'
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
