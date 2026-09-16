module.exports = {
  content: [
    './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}', // Add this line
    './src/**/*.{js,jsx,ts,tsx}', // Your project's files
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)'
      }
    },
  },
  plugins: [
    require('flowbite/plugin'), // Add this line
  ],
};
