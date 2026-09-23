const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = {
  resolver: {
    unstable_conditionNames: ["require", "react-native", "browser"],
    // Support .native.ts and .web.ts files in resolution
    sourceExts: ["native.ts", "native.tsx", "web.ts", "web.tsx", "ts", "tsx", "js", "jsx", "json"],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
