/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        creme: '#F2EBD9',
        navy: '#1A2744',
        red: { DEFAULT: '#C0281C', deep: '#8B1A10' },
        gold: { DEFAULT: '#D4A843', light: '#F0CC6E' },
      },
      fontFamily: {
        bebas: ['var(--font-bebas)'],
        playfair: ['var(--font-playfair)'],
        dm: ['var(--font-dm)'],
      },
    },
  },
  plugins: [],
}
