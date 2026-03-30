const path = require("path");
const metroTransformWorker = require("metro-transform-worker");
const { transform: cssInteropTransform } = require("react-native-css-interop/metro/transformer");

async function transform(config, projectRoot, filename, data, options) {
  if (path.resolve(process.cwd(), filename) === config.nativewind.input) {
    if (options.platform !== "web" && options.dev && options.hot) {
      return metroTransformWorker.transform(
        config,
        projectRoot,
        filename,
        Buffer.from(
          `const { StyleSheet } = require("react-native-css-interop");
const url = require("react-native/Libraries/Core/Devtools/getDevServer")().url.replace(/(https?:\\/\\/.*)(:\\d*\\/)(.*)/, "$1$3")
new globalThis.WebSocket(\`${url}:${config.nativewind.fastRefreshPort}\`).addEventListener("message", (event) => StyleSheet.register(JSON.parse(event.data)));
StyleSheet.register(JSON.parse('${config.nativewind.initialData}'));`,
          "utf8"
        ),
        options
      );
    }

    const relativeOutput = path.relative(path.dirname(filename), config.nativewind.output).replace(/\\/g, "/");
    const safeImportPath = relativeOutput.startsWith(".") ? relativeOutput : `./${relativeOutput}`;

    return metroTransformWorker.transform(
      config,
      projectRoot,
      filename,
      Buffer.from(`import '${safeImportPath}'`, "utf8"),
      options
    );
  }

  return cssInteropTransform(config, projectRoot, filename, data, options);
}

module.exports.transform = transform;
