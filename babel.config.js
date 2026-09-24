const { execFileSync } = require("node:child_process");

const resolveReactNativePreset = () => {
  try {
    return require.resolve("@react-native/babel-preset");
  } catch {
    return require.resolve("@react-native/metro-babel-transformer/node_modules/@react-native/babel-preset");
  }
};

module.exports = (api) => {
  const commitSha = api.cache.using(() =>
    execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { encoding: "utf8" }).trim()
  );
  return {
    presets: [resolveReactNativePreset()],
    plugins: [
      ({ types }) => ({
        visitor: {
          Identifier(path) {
            if (path.isReferencedIdentifier({ name: "__COMMIT_SHA__" }))
              path.replaceWith(types.stringLiteral(commitSha));
          },
        },
      }),
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
