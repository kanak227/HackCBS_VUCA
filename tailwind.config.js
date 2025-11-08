/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-cyan': '#00f0ff',
        'cyber-purple': '#b026ff',
        'cyber-magenta': '#ff00ff',
        'cyber-dark': '#0a0a0f',
        'cyber-darker': '#050508',
        'cyber-glass': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #00f0ff 0%, #b026ff 50%, #ff00ff 100%)',
        'gradient-dark': 'linear-gradient(180deg, #050508 0%, #0a0a0f 100%)',
      },
      boxShadow: {
        'cyber-glow': '0 0 20px rgba(0, 240, 255, 0.5)',
        'cyber-glow-purple': '0 0 20px rgba(176, 38, 255, 0.5)',
        'cyber-glow-magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
      },
      animation: {
        'pulse-cyber': 'pulse-cyber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-cyber': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)' },
          '50%': { opacity: 0.8, boxShadow: '0 0 40px rgba(0, 240, 255, 0.8)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 30px rgba(0, 240, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

