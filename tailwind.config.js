/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          50:  '#f8f9fc',
          100: '#f0f2f8',
          900: '#0e1117',
          800: '#161b27',
          700: '#1d2433',
          600: '#232c3e',
          500: '#2a3349',
        },
        accent: {
          DEFAULT: '#6c63ff',
          light:   '#9b95ff',
          dark:    '#4b43cc',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glass:  '0 4px 24px -2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow:   '0 0 20px rgba(108,99,255,0.25)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.2)',
      },
      backgroundImage: {
        'grid-dark': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v1H0zM0 0v40H1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
