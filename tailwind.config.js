/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ['./*.{html,js}'],
  theme: {
    extend: {},
  },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
}

