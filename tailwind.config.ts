import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7AD1D1',
        'primary-dark': '#5BBABA',
        'primary-light': '#9CE0E0',
        'primary-pale': '#E5F7F7',
        'accent-teal': '#5BBABA',
        'accent-coral': '#E8A5A5',
        'accent-purple': '#9B8BBC',
        'accent-wood': '#C4A77D',
        background: '#FAF7F2',
        'background-cream': '#F5EDE4',
        surface: '#FFFFFF',
        'surface-2': '#FBF9F6',
        border: '#E5DDD3',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
