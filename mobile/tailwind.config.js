module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#11C76F',
          dark: '#000000',
          gray: '#F5F5F5',
          light: '#FFFFFF'
        },
        picpay: {
          50: '#E8F9F1',
          100: '#D1F3E2',
          500: '#11C76F',
          600: '#0EAB5F',
          700: '#0A8A4D'
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px'
      }
    },
  },
  plugins: [],
}
