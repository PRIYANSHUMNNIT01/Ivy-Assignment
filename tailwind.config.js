/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#ea580c',
          light:   '#fff7ed',
          dark:    '#c2410c',
        },
        warm: {
          50:  '#fafaf8',
          100: '#f5f5f4',
          200: '#e8e3dc',
          300: '#d4c5b2',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#1c1917',
        },
      },
    },
  },
  plugins: [],
};
