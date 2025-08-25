const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAliases({
  '~': path.resolve(__dirname, 'src'),
  'middleware': path.resolve(__dirname, 'src/middleware'),
  'config': path.resolve(__dirname, 'config'),
  'domains': path.resolve(__dirname, 'src/domains'),
  'services': path.resolve(__dirname, 'src/services'),
  'utils': path.resolve(__dirname, 'src/utils'),
  'models': path.resolve(__dirname, 'models')
});
