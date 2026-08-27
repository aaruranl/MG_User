/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          burgundy: '#5c142b',
          'burgundy-dark': '#3b0918',
          'burgundy-light': '#7e1e3b',
          'burgundy-subtle': '#fdf2f4',
          gold: '#c99839',
          'gold-light': '#f5d78e',
          'gold-dark': '#9b7223',
          'rose-gold': '#e29578',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 10px 30px rgba(92, 20, 43, 0.08)',
        'luxury-lg': '0 20px 45px rgba(92, 20, 43, 0.14)',
        gold: '0 8px 25px rgba(201, 152, 57, 0.25)',
      }
    },
  },
  plugins: [],
}
