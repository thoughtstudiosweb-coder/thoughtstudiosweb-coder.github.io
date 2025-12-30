/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'rose-gold': {
          DEFAULT: '#C19A6B',
          light: '#D4A574',
          dark: '#B8860B',
        },
      },
    },
  },
  plugins: [],
}

