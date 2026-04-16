module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["module:@react-native/babel-preset"],
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
