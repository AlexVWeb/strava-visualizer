/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        strava: {
          DEFAULT: '#fc4c02',
          hover: '#e34402',
        },
        dark: {
          bg: {
            primary: '#121212',
            secondary: '#1e1e1e',
            tertiary: '#2d2d2d'
          },
          text: {
            primary: '#ffffff',
            secondary: '#a0a0a0'
          }
        }
      },
    },
  },
  plugins: [],
} 