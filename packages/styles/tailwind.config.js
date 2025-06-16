/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#005AAF',
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CCFF',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#005AAF',
          600: '#004B93',
          700: '#003C77',
          800: '#002D5B',
          900: '#001E3F',
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#0078D4',
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#0078D4',
          600: '#0066B2',
          700: '#005490',
          800: '#00426E',
          900: '#00304C',
        },
        // Accent colors
        accent: {
          DEFAULT: '#00B8A9',
          50: '#E6FFFC',
          100: '#CCFFF9',
          200: '#99FFF3',
          300: '#66FFED',
          400: '#33FFE7',
          500: '#00B8A9',
          600: '#009B8D',
          700: '#007E71',
          800: '#006155',
          900: '#004439',
        },
        // UI colors
        border: '#D1D5DB',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        // Status colors
        success: '#34D399',
        warning: '#FBBF24',
        error: '#EF4444',
        // Text colors
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-disabled': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        'noto-jp': ['Noto Sans JP', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.625',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};