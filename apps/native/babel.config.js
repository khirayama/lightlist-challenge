module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['nativewind/babel', { input: './src/styles/global.css' }],
      'react-native-reanimated/plugin',
    ],
  };
};