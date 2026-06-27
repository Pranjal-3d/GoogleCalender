/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'in': 'in 0.2s ease',
        'fade-in': 'fadeIn 0.2s ease',
        'zoom-in': 'zoomIn 0.2s ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        zoomIn: {
          from: { transform: 'scale(0.95)' },
          to: { transform: 'scale(1)' },
        },
        in: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
