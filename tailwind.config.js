/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#F2EAFE',100:'#E6D4FD',200:'#C9A9FB',300:'#AC7EF9',
          400:'#9054F7',500:'#7C3AED',600:'#622EBE',700:'#49238E',
          800:'#31185F',900:'#1A0C31'
        }
      },
      borderRadius: { '2xl': '1.25rem' },
      boxShadow: { soft: '0 8px 24px rgba(124,58,237,0.15)' }
    }
  },
  plugins: [],
};
