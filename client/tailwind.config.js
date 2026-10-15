/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#100D08",
          black: "#0A0805",
          surface: "#18140E",
          card: "#1E1810",
          border: "#8C6514",
        },
        gold: {
          DEFAULT: "#FFC857",
          light: "#F7E7B0",
          pale: "#FFF3D1",
          dark: "#B8860B",
          deep: "#8C6514",
          dim: "rgba(255, 200, 87, 0.15)"
        },
        squid: {
          pink: "#ff0055",
          teal: "#00f5d4",
          cyan: "#38bdf8",
          blood: "#e11d48"
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Outfit"', '"Inter"', 'sans-serif']
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'stamp': 'stamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { opacity: '0.95', filter: 'drop-shadow(0 0 16px rgba(255, 200, 87, 0.8))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 6px rgba(255, 200, 87, 0.3))' },
        },
        stamp: {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
