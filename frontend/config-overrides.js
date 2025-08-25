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

  return config;
};