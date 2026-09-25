/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#090d16',
          900: '#0f172a',
          850: '#152033',
          800: '#1e293b',
          750: '#27354d',
          700: '#334155',
          600: '#475569',
        },
        saffron: {
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        brand: {
          indigo: '#2563eb',
          navy: '#1e40af',
          accent: '#3b82f6',
          slate: '#64748b',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ea580c',
          critical: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
