const colors = require('tailwindcss/colors')

module.exports = {
    mode: 'jit',
    purge: [],
    darkMode: false, // or 'media' or 'class'
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
    plugins: [],
  }