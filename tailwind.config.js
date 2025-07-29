/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        xl2: '1400px',         // добавляешь
        '900': '900px',        // для кастомного условия
        '3xl': '1920px',
        '4xl': '3440px',
      },
    },
  },
  plugins: [],
}
