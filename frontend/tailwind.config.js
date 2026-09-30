/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
      },
      fontSize: {
        '2xs': ['0.8125rem', { lineHeight: '1.125rem' }],
        'xs': ['0.9375rem', { lineHeight: '1.375rem' }],
        'sm': ['1.0625rem', { lineHeight: '1.5rem' }],
        'base': ['1.1875rem', { lineHeight: '1.75rem' }],
        'lg': ['1.3125rem', { lineHeight: '1.875rem' }],
        'xl': ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.125rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.625rem', { lineHeight: '2.875rem' }],
      },
    },
  },
  plugins: [],
}
