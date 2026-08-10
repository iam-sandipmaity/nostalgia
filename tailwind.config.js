/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f4ecd8',
        'paper-white': '#fdfbf7',
        'dark-brown': '#3e2723',
        charcoal: '#333333',
        'faded-red': '#d32f2f',
        mustard: '#fbc02d',
        'deep-green': '#2e7d32',
      },
      fontFamily: {
        bengali: ['"Tiro Bangla"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
