/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust paths if needed
  ],
  theme: {
    extend: {
      colors: {
        primary: "#800080", // Your primary color
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        ping: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '75%, 100%': { transform: 'scale(2)', opacity: 0 },
        },
        'float-fade': {
          '0%': { transform: 'translateY(0)', opacity: 0.7 },
          '50%': { transform: 'translateY(-10px)', opacity: 1 },
          '100%': { transform: 'translateY(0)', opacity: 0.7 },
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-fade': 'float-fade 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
