import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf3',
          100: '#c5d1e0',
          200: '#9fb3ca',
          300: '#7995b4',
          400: '#587ea4',
          500: '#376794',
          600: '#2d5a85',
          700: '#1e4470',
          800: '#112740',
          900: '#071B34',
          950: '#040f1d',
          DEFAULT: '#071B34',
        },
        gold: {
          50:  '#fdf8ee',
          100: '#f9efd0',
          200: '#f3de9e',
          300: '#ecc863',
          400: '#e6b43c',
          500: '#C8A35F',
          600: '#b08030',
          700: '#8f6520',
          800: '#6e4d1a',
          900: '#513815',
          DEFAULT: '#C8A35F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,163,95,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(200,163,95,0)' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.06)',
        sidebar: '4px 0 24px rgba(0,0,0,0.15)',
        topbar: '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}

export default config
