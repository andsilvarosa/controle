module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      require.resolve("react-native-worklets/plugin"),
      require.resolve("react-native-reanimated/plugin"),
    ],
  };
};
