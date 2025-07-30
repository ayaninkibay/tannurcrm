// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        // стандартные
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        // дополнительные
        xl2: '1400px',
        '3xl': '1920px',
        '4xl': '3440px',
        // ваш кастом
        sidebar: '900px',
      },
    },
  },
  plugins: [],
}
