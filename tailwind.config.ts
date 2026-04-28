import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B7C9E',
        'primary-dark': '#4A6580',
        'primary-light': '#7BA3C4',
        'primary-pale': '#E8F1F8',
        'accent-teal': '#7DBAB5',
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
