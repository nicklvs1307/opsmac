module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and eslint-config-prettier
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};