const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const baseConfig = getDefaultConfig(__dirname);
const config = withNativeWind(baseConfig, { input: "./global.css" });

config.transformerPath = require.resolve("./nativewind-transformer");

module.exports = config;
