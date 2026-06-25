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
        darkBg: '#08080a',
        darkSecondary: '#0d0d12',
        darkCard: '#121218',
        darkBorder: 'rgba(255,255,255,0.065)',
        brand: {
          50:  '#f3f4fc',
          100: '#e5e6f9',
          500: '#5e6ad2',
          600: '#4d58be',
          700: '#3e47a6',
        }
      }
    }
  },
  plugins: []
}
