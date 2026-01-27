/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b3c5fb',
          400: '#8da5f7',
          500: '#667eea',
          600: '#5463d4',
          700: '#4551b8',
          800: '#3a4395',
          900: '#333b78',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}