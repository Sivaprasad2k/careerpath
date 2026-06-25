/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        darkBg: '#0B1020',
        darkSecondary: '#12172A',
        darkCard: '#161C31',
        darkBorder: 'rgba(255,255,255,0.08)',
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6d5dfc',
          600: '#7c3aed',
          700: '#8b5cf6',
        }
      }
    }
  },
  plugins: []
}
