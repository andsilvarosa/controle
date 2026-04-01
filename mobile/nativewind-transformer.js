const fs = require("fs");
const path = require("path");
const metroTransformWorker = require("metro-transform-worker");
const { cssToReactNativeRuntime } = require("react-native-css-interop/css-to-rn");
const { transform: cssInteropTransform } = require("react-native-css-interop/metro/transformer");

async function waitForGeneratedCss(filePath) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`NativeWind generated CSS not found: ${filePath}`);
}

async function transform(config, projectRoot, filename, data, options) {
  const absolutePath = path.isAbsolute(filename) ? filename : path.resolve(projectRoot, filename);
  if (absolutePath === config.nativewind.input) {
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

    const generatedCssPath = `${config.nativewind.output}.${options.platform !== "web" ? "native" : "web"}.css`;
    const generatedCss = await waitForGeneratedCss(generatedCssPath);
    const runtimeData = JSON.stringify(
      cssToReactNativeRuntime(generatedCss, config.transformer?.cssToReactNativeRuntime)
    );

    return metroTransformWorker.transform(
      config,
      projectRoot,
      filename,
      Buffer.from(`require("react-native-css-interop").StyleSheet.register(${runtimeData})`, "utf8"),
      options
    );
  }

  return cssInteropTransform(config, projectRoot, filename, data, options);
}

module.exports.transform = transform;
