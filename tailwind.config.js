module.exports = {
  /** @type {import('tailwindcss').Config} */
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366f1',
          DEFAULT: '#4f46e5',
          dark: '#3730a3',
        },
        secondary: {
          light: '#f8fafc',
          DEFAULT: '#e2e8f0',
          dark: '#cbd5e1',
        },
        accent: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
      },
    },
  },
  plugins: [],
};
