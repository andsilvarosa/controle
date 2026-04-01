module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "react-native-worklets": require.resolve("react-native-worklets"),
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
