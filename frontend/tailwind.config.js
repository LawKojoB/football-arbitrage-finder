/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // JetBrains Mono for numeric/tabular data, Inter-alternative for body
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0a0d12',
          800: '#0f131a',
          700: '#161b24',
          600: '#1d242f',
          500: '#2a3340',
          400: '#3b4655',
        },
        accent: {
          green: '#22d39a',
          'green-dim': '#0e6b50',
          red: '#ff5e62',
          amber: '#ffb547',
        },
      },
      boxShadow: {
        glow: '0 0 30px -8px rgba(34, 211, 154, 0.35)',
      },
    },
  },
  plugins: [],
};
