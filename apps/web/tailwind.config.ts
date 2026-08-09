import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand guidelines — surfaces (mapped from previous ink tokens)
        ink: {
          DEFAULT: '#F5F6FA',
          light: '#FFFFFF',
          lighter: '#EEF0F8',
        },
        // Brand blue (mapped from previous mint tokens for system-wide accent)
        mint: {
          DEFAULT: '#5D74E5',
          light: '#7B8DEB',
          dark: '#4559C7',
        },
        // Text on light surfaces (mapped from chalk)
        chalk: {
          DEFAULT: '#000000',
          muted: '#2A2A2A',
          dim: '#5C6370',
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
        error: '#D93025',
        warning: '#E6A700',
      },
      fontFamily: {
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(93, 116, 229, 0.12)',
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
