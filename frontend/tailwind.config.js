/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Geist', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace']
      },
      colors: {
        // Brand – a deep slate with warm amber accent
        brand: {
          50:  '#fdfaf3',
          100: '#faf3e0',
          200: '#f5e3b3',
          300: '#edcb78',
          400: '#e4ae40',
          500: '#d4952a',
          600: '#b87620',
          700: '#925a1b',
          800: '#77481b',
          900: '#633c1a',
          950: '#381e09'
        },
        // Neutral – stone-based for warmth
        stone: {
          25:  '#fdfcfb',
          50:  '#faf9f7',
          100: '#f4f2ef',
          200: '#e8e4df',
          300: '#d5cfc8',
          400: '#b5aca2',
          500: '#8f8278',
          600: '#6b5f56',
          700: '#574e47',
          800: '#3d3631',
          900: '#28231f',
          950: '#161210'
        }
      },
      boxShadow: {
        'xs':     '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'panel':  '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'modal':  '0 20px 60px -10px rgb(0 0 0 / 0.2), 0 8px 16px -8px rgb(0 0 0 / 0.1)',
        'float':  '0 8px 32px -4px rgb(0 0 0 / 0.12)'
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem'
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':    'shimmer 1.8s infinite'
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },           to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:   { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } }
      }
    }
  },
  plugins: []
};
