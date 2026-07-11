/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50: '#FFF7ED', 100: '#FFEAD5', 200: '#FFD5A8', 300: '#FFC07A', 400: '#FFAB4D', 500: '#FF9933', 600: '#E68A2E', 700: '#CC7A29', 800: '#B36B24', 900: '#995C1F' },
        flag: { saffron: '#FF9933', green: '#138808', navy: '#000080', white: '#FFFFFF' },
      },
      borderRadius: { '2xl': '16px' }
    }
  },
  plugins: []
}
