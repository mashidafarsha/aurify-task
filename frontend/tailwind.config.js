/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        aurify: {
          50: '#f4f6f8',
          100: '#e3e8ee',
          200: '#cdd7e1',
          300: '#aabccc',
          400: '#809bb0',
          500: '#5e7d95',
          600: '#4a6479',
          700: '#3d5264',
          800: '#344554',
          900: '#2f3b46',
          950: '#1e262e',
        },
        gold: {
          light: '#FDF1D6',
          DEFAULT: '#D4AF37',
          dark: '#AA8C2C',
        }
      }
    },
  },
  plugins: [],
}
