const resolveReactNativePreset = () => {
  try {
    return require.resolve("@react-native/babel-preset");
  } catch {
    return require.resolve("@react-native/metro-babel-transformer/node_modules/@react-native/babel-preset");
  }
};

module.exports = (api) => {
  api.cache(true);
  return {
    presets: [resolveReactNativePreset()],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "~": "./src",
          },
        },
      ],
    ],
  };
};
