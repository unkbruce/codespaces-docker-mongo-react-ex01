/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        book: {
          paper: '#fffaf2',
          linen: '#f4efe7',
          ink: '#25302f',
          muted: '#68766f',
          green: '#1f5f5b',
          greenDark: '#174a47',
          amber: '#c47a2c',
        },
      },
      boxShadow: {
        soft: '0 14px 36px rgba(52, 76, 70, 0.12)',
      },
    },
  },
  plugins: [],
};
