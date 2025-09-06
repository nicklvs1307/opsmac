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

  // Remove ModuleScopePlugin
  config.resolve.plugins = config.resolve.plugins.filter(plugin => {
    return plugin.constructor.name !== 'ModuleScopePlugin';
  });

  // Remove the specific aliases for @mui/material and @mui/icons-material
  if (config.resolve.alias) {
    delete config.resolve.alias['@mui/material'];
    delete config.resolve.alias['@mui/icons-material'];
  }

  // Add rule to handle fully specified imports for mjs and js files
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
};