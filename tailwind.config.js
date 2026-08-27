/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--mg-primary)',
          dark: 'var(--mg-primary-dark)',
          light: 'var(--mg-primary-light)',
          subtle: 'var(--mg-primary-subtle)',
        },
        gold: {
          DEFAULT: 'var(--mg-accent-gold)',
          light: 'var(--mg-accent-gold-light)',
          dark: 'var(--mg-accent-gold-dark)',
          rose: 'var(--mg-accent-rose-gold)',
        },
        surface: {
          app: 'var(--mg-bg-app)',
          card: 'var(--mg-bg-surface)',
          subtle: 'var(--mg-bg-subtle)',
        },
        text: {
          main: 'var(--mg-text-main)',
          muted: 'var(--mg-text-muted)',
          light: 'var(--mg-text-light)',
        },
        luxury: {
          burgundy: 'var(--mg-primary)',
          'burgundy-dark': 'var(--mg-primary-dark)',
          'burgundy-light': 'var(--mg-primary-light)',
          'burgundy-subtle': 'var(--mg-primary-subtle)',
          gold: 'var(--mg-accent-gold)',
          'gold-light': 'var(--mg-accent-gold-light)',
          'gold-dark': 'var(--mg-accent-gold-dark)',
          'rose-gold': 'var(--mg-accent-rose-gold)',
        }
      },
      fontFamily: {
        serif: ['var(--mg-font-serif)', 'Poppins', 'sans-serif'],
        sans: ['var(--mg-font-sans)', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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
