/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a1a2e', light: '#2d2d4e' },
        accent:  { DEFAULT: '#6c63ff', hover: '#5a52d5' },
      },
    },
  },
  plugins: [],
}