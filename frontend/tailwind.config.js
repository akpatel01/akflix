/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#e50914',
        'netflix-red-hover': '#f40612',
        'netflix-black': '#141414',
        'netflix-dark': '#111',
        'netflix-light-gray': '#ddd',
        'netflix-gray': '#777'
      },
      height: {
        '80vh': '80vh'
      },
      backgroundPosition: {
        'center-top': 'center top'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        scaleIn: 'scaleIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-in-out',
        bounce: 'bounce 1s infinite'
      }
    },
  },
  plugins: [],
} 