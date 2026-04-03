/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#f7f5ef',
          100: '#f0e9d9',
          200: '#e5d7bc',
          300: '#d7be96',
          400: '#caa370',
          500: '#b7834f',
        },
      },
      fontFamily: {
        display: ['"Lora"', 'serif'],
        sans: ['"IBM Plex Sans"', 'Avenir', 'Arial', 'sans-serif'],
      },
    },
  },
}
