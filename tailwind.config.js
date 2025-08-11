/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4F0FF',
          100: '#E9E3FF',
          200: '#D3C7FF',
          300: '#BBA8FF',
          400: '#A184FF',
          500: '#8A63FF',
          600: '#7C3AED', // primary
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 10px 25px rgba(124,58,237,.15)',
        soft: '0 6px 16px rgba(0,0,0,.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
