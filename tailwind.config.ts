import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          // Live-themable via Appearance editor (CSS var injected in root layout)
          DEFAULT: 'rgb(var(--brand-primary, 0 200 83) / <alpha-value>)',
          50: '#E8F8EE',
          100: '#C4EFD2',
          200: '#9CE5B5',
          300: '#6ED891',
          400: '#3FCB72',
          500: '#00C853',
          600: '#00B247',
          700: '#00963A',
          800: '#007A2E',
          900: '#005C22',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'rgb(var(--brand-secondary, 0 102 255) / <alpha-value>)',
          50: '#E6F0FF',
          100: '#B8D3FF',
          200: '#8AB5FF',
          300: '#5C97FF',
          400: '#2E79FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: 'rgb(var(--brand-accent, 255 184 0) / <alpha-value>)',
          50: '#FFF7E0',
          100: '#FFEBB3',
          200: '#FFDF85',
          300: '#FFD357',
          400: '#FFC729',
          500: '#FFB800',
          600: '#CC9300',
          700: '#996E00',
          800: '#664A00',
          900: '#332500',
          foreground: '#0F172A',
        },
        dark: {
          DEFAULT: '#0F172A',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: { DEFAULT: '#10B981', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#F59E0B', foreground: '#FFFFFF' },
        danger: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        // System font stack — no network dependency at build time.
        // Renders as: SF Pro (macOS/iOS), Segoe UI (Windows), Roboto (Android), system fallback.
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(15, 23, 42, 0.08)',
        glow: '0 0 40px -8px rgba(0, 200, 83, 0.45)',
        'glow-blue': '0 0 40px -8px rgba(0, 102, 255, 0.45)',
        premium: '0 20px 50px -12px rgba(15, 23, 42, 0.18)',
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.10)',
      },
      backgroundImage: {
        'mesh-primary':
          'radial-gradient(at 20% 20%, rgba(0,200,83,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,102,255,0.18) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(255,184,0,0.12) 0px, transparent 50%)',
        'grid-slate':
          'linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
