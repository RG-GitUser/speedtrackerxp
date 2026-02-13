/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0f5',
          100: '#ffe5ed',
          200: '#ffccd9',
          300: '#ffb3c6',
          400: '#ff99b3',
          500: '#ff80a0',
          600: '#ff668c',
          700: '#ff4d79',
          800: '#ff3366',
          900: '#e62e5c',
        },
        accent: {
          50: '#fef5ff',
          100: '#fde5ff',
          200: '#facfff',
          300: '#f7b3ff',
          400: '#f599ff',
          500: '#f280ff',
          600: '#e666ff',
          700: '#d94dff',
          800: '#cc33ff',
          900: '#b31aff',
        }
      }
    },
  },
  plugins: [],
}
