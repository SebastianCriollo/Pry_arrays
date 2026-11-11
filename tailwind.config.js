/** @type {import('tailwindcss').Config} */

// Los colores salen de variables CSS para que cada negocio tenga su tema
// (ver src/lib/theme.js). Se guardan como "R G B" para poder usar opacidad:
// bg-primary/10, text-ink/60, etc.
const color = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: color('primary'),       // color de marca del negocio
        'on-primary': color('on-primary'), // texto sobre el color de marca
        bg: color('bg'),                 // fondo de la página
        surface: color('surface'),       // tarjetas
        ink: color('ink'),               // texto
      },
      fontFamily: {
        // Una sola familia (Sen): "display" se mantiene para títulos en negrita.
        display: ['Sen', 'system-ui', 'sans-serif'],
        sans: ['Sen', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.03), 0 12px 32px -10px rgb(150 150 154 / 0.35)',
        float: '0 10px 30px -8px rgb(0 0 0 / 0.3)',
      },
      keyframes: {
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        pop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.12)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
