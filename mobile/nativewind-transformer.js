const fs = require("fs");
const path = require("path");
const metroTransformWorker = require("metro-transform-worker");
const { cssToReactNativeRuntime } = require("react-native-css-interop/css-to-rn");

async function transform(config, projectRoot, filename, data, options) {
  const absolutePath = path.isAbsolute(filename) ? filename : path.resolve(projectRoot, filename);
  
  // Se for o arquivo de entrada do NativeWind (global.css)
  if (filename.endsWith("global.css")) {
    const platform = options.platform || "native";
    const cacheDir = path.join(projectRoot, "node_modules", ".cache", "nativewind");
    const generatedCssPath = path.join(cacheDir, `global.css.${platform}.css`);

    // Tenta encontrar o arquivo gerado pelo NativeWind
    let generatedCss = "";
    for (let attempt = 0; attempt < 30; attempt++) {
      if (fs.existsSync(generatedCssPath)) {
        generatedCss = fs.readFileSync(generatedCssPath, "utf8");
        break;
      }
      // Se não existir, espera um pouco (o NativeWind CLI/plugin deve estar gerando)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (generatedCss) {
      try {
        const runtimeData = JSON.stringify(cssToReactNativeRuntime(generatedCss));
        return metroTransformWorker.transform(
          config,
          projectRoot,
          filename,
          Buffer.from(`require("react-native-css-interop").StyleSheet.register(${runtimeData})`, "utf8"),
          options
        );
      } catch (e) {
        console.error(`[NativeWind] Error parsing CSS for ${platform}:`, e);
      }
    }
    
    // Se falhar em encontrar o CSS gerado, tenta retornar um CSS vazio para não quebrar o bundle
    console.warn(`[NativeWind] Warning: Generated CSS not found for ${platform}. Returning empty styles.`);
    return metroTransformWorker.transform(
      config,
      projectRoot,
      filename,
      Buffer.from(`require("react-native-css-interop").StyleSheet.register({})`, "utf8"),
      options
    );
  }

  // Para outros arquivos, usa o transformer padrão (babel-preset-expo)
  return metroTransformWorker.transform(config, projectRoot, filename, data, options);
}

module.exports.transform = transform;
