/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-background',
    'bg-header',
    'hover:bg-hover',
    'text-header',
    'text-background',
    'hover:text-hover',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5EEDE',
        header: '#343a40',
        hover: '#495057',
        card: '#ffffff',
      },
    },
  },
  plugins: [],
};
