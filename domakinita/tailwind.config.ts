import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a6ff',
          500: '#3384fb',
          600: '#1d63f0',
          700: '#164ddc',
          800: '#1840b2',
          900: '#1a3a8c',
          950: '#0b2a63',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c9',
          400: '#8591a9',
          500: '#66738d',
          600: '#515c74',
          700: '#424a5e',
          800: '#3a4050',
          900: '#0f1421',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,20,33,.06), 0 8px 24px -12px rgba(15,20,33,.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
}

export default config
