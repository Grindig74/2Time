/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f1a',
        glass: 'rgba(255,255,255,0.06)',
        neon: '#7DF9FF',
        neon2: '#C084FC'
      },
      boxShadow: {
        neon: '0 0 24px rgba(125,249,255,0.35)',
        neon2: '0 0 24px rgba(192,132,252,0.35)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
