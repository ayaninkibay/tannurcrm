// tailwind.config.js
const path = require('path')
const { breakpoints } = require(
  path.resolve(__dirname, 'src/components/breakpoints.js')
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './test/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      ...breakpoints,
    },
    extend: {
      // сюда можно добавлять цвета, отступы и т.д.
    },
  },
  plugins: [],
}
