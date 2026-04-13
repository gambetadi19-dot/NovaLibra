/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#060816',
          900: '#0b1020',
          800: '#10182d',
          700: '#182340',
          600: '#23365c',
          gold: '#d6ae62',
          sand: '#f0dfc0',
          ink: '#d6d7df'
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Manrope"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 20px 60px rgba(214, 174, 98, 0.18)'
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at top right, rgba(214,174,98,0.22), transparent 32%), radial-gradient(circle at bottom left, rgba(59,130,246,0.18), transparent 34%)'
      }
    }
  },
  plugins: []
};
