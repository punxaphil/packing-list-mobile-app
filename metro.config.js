const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = {
  resolver: {
    unstable_conditionNames: ["require", "react-native", "browser"],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
