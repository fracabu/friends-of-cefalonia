import type { Config } from 'tailwindcss'

/**
 * I colori neutri passano da variabili CSS, non da valori fissi: è così che
 * il tema scuro può ribaltare la scala senza toccare una sola classe nei
 * componenti. `ink-50` resta «il fondo della pagina» e `ink-900` «il testo
 * più forte» in entrambi i temi — cambia solo che cosa vogliono dire.
 */
const inchiostro = (numero: number) => `rgb(var(--ink-${numero}) / <alpha-value>)`

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
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
          50: inchiostro(50),
          100: inchiostro(100),
          200: inchiostro(200),
          300: inchiostro(300),
          400: inchiostro(400),
          500: inchiostro(500),
          600: inchiostro(600),
          700: inchiostro(700),
          800: inchiostro(800),
          900: inchiostro(900),
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
