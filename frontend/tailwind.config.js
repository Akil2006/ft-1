/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F4F7F4',
          100: '#E8F5E9',
          200: '#D8F3DC',
          400: '#34D399',
          500: '#15803D',
          600: '#166534',
          700: '#14532D',
          800: '#0F392B',
          900: '#08271C',
        },
        ivory: {
          50: '#FFFDF9',
          100: '#FAF7EE',
          200: '#F8F5EC',
          300: '#F4EFE0',
          400: '#EDE6D5',
        },
        sage: {
          50: '#F5F7F5',
          100: '#E8EFE8',
          200: '#D9E3D9',
          300: '#B8C9B8',
          500: '#84A98C',
          700: '#4A6B53',
        },
        sand: {
          50: '#FBF9F5',
          100: '#F5F0EB',
          200: '#EDE6DD',
          300: '#E2D7CB',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        handwriting: ['Caveat', 'Kalam', 'cursive'],
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
