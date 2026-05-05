/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        felt: {
          dark: '#0f2318',
          mid: '#1a4a2e',
          light: '#1e5534',
        },
      },
      animation: {
        'deal': 'dealCard 300ms ease forwards',
        'highlight': 'highlightPulse 1s ease infinite',
        'penalty': 'penaltyShake 400ms ease',
        'fade-slide-up': 'fadeSlideUp 400ms ease forwards',
        'slide-in-modal': 'slideInModal 350ms ease forwards',
      },
    },
  },
  plugins: [],
};