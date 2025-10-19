const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  '@firebase/app': require.resolve('firebase/app'),
  '@firebase/auth': require.resolve('firebase/auth'),
};

module.exports = config;
