const { alias } = require('react-app-rewire-alias');
const path = require('path');

module.exports = function override(config) {
  alias({
    '@': 'src',
    '@/app': 'src/app',
    '@/pages': 'src/pages',
    '@/components': 'src/components',
    '@/features': 'src/features',
    '@/services': 'src/services',
    '@/hooks': 'src/hooks',
    '@/store': 'src/store',
    '@/utils': 'src/utils',
    '@/types': 'src/types',
    '@/assets': 'src/assets',
  })(config);

  config.resolve.alias = {
    ...config.resolve.alias,
    '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material/index.js'),
    '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material/index.js'),
  };

  return config;
};