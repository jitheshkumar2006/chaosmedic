/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07070B',
        surface: {
          DEFAULT: '#0D0B14',
          light: '#151020',
          elevated: '#1D172E',
          border: '#261E3B',
          hover: '#221936'
        },
        bp: {
          violet: '#7C3AED',
          bright: '#A855F7',
          deep: '#5B21B6',
          text: '#F5F3FF',
          muted: '#9893A8',
          dim: '#666075',
          border: '#241D35',
          borderLight: '#352B4D',
        },
        accent: {
          violet: '#7C3AED',
          brightViolet: '#A855F7',
          green: '#10B981',
          red: '#EF4444',
          yellow: '#F59E0B',
          blue: '#3B82F6',
        }
      },
      boxShadow: {
        panel: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(124, 58, 237, 0.12)',
        'panel-subtle': '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow-violet': '0 0 24px rgba(124, 58, 237, 0.25)',
        'glow-violet-sm': '0 0 12px rgba(124, 58, 237, 0.3)',
        'glow-red': '0 0 24px rgba(239, 68, 68, 0.25)',
        'glow-green': '0 0 24px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
