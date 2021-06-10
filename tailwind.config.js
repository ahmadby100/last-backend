const colors = require('tailwindcss/colors')

module.exports = {
    mode: 'jit',
    purge: [],
    darkMode: true, // or 'media' or 'class'
    theme: {
      extend: {
        colors: {
          'light-blue': colors.lightBlue,
          'light-red': colors.lightRed,
          cyan: colors.cyan,
        },
      },
    },
    variants: {
      extend: {},
    },
    plugins: [require('tailwindcss-dark-mode')()],
  }