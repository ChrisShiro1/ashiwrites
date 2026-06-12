/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          50:  '#fdf8f0',
          100: '#f9edd9',
          200: '#f2d5a8',
          300: '#e8b86d',
          400: '#dd9a3c',
          500: '#c97d1e',
          600: '#a35e12',
          700: '#7d4410',
          800: '#5c3010',
          900: '#3d1f0a',
        },
        parchment: '#fdf6e9',
        midnight: '#0f0e17',
      },
    },
  },
  plugins: [],
}