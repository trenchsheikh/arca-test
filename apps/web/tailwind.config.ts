import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '0.75rem',
        sm: '1rem',
        lg: '1.25rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '920px',
        xl: '1000px',
        '2xl': '1080px',
      },
    },
    extend: {
      colors: {
        // Dark surfaces
        ink: {
          DEFAULT: '#000000',
          light: '#12141C',
          lighter: '#1A1D28',
        },
        // Brand blue
        mint: {
          DEFAULT: '#5D74E5',
          light: '#7B8DEB',
          dark: '#4559C7',
        },
        // Text on dark surfaces
        chalk: {
          DEFAULT: '#F5F6FA',
          muted: '#C8CCD6',
          dim: '#8B91A0',
        },
        brand: {
          DEFAULT: '#5D74E5',
          light: '#7B8DEB',
          dark: '#4559C7',
        },
        gold: {
          DEFAULT: '#5D74E5',
          light: '#7B8DEB',
          dark: '#4559C7',
        },
        error: '#FF6B6B',
        warning: '#F0B429',
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.45)',
        card: '0 4px 24px rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
