/** @type {import('tailwindcss').Config} */
module.exports = {
  // Array content tetap diperlukan untuk Next.js
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  darkMode : 'class', // atau 'media' jika ingin otomatis
  theme: {
    extend: {},
  },
  plugins: [
    // Array plugins ini sekarang dikosongkan
  ],
}