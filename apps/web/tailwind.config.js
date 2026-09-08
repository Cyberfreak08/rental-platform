/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F7F5',
        surface: '#FFFFFF',
        'surface-alt': '#EFEFEC',
        text: '#171717',
        'text-muted': '#666666',
        border: '#DCDCD6',
        brand: {
          DEFAULT: '#1F5D54',
          strong: '#16483F',
          soft: '#E7F2EF',
        },
        success: '#1F7A4D',
        warning: '#A86A00',
        danger: '#B42318',
        info: '#175CD3',
      },
      borderRadius: {
        control: '8px',
        input: '12px',
        card: '12px',
        'feature-card': '16px',
        hero: '20px',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
