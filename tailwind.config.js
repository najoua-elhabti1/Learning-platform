/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        customYellow: '#fdad02',
        customBlue: '#104b9b',
      },
    },
  },
  plugins: [],
};
