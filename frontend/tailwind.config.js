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
        dark: {
          950: '#090d16',
          900: '#0d1322',
          850: '#11182c',
          800: '#162038',
          700: '#1e2d4f',
          600: '#2c3e6b'
        },
        accent: {
          bullish: '#10b981',
          bullishGlow: '#059669',
          bearish: '#f43f5e',
          bearishGlow: '#e11d48',
          primary: '#3b82f6',
          gold: '#f59e0b',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}

