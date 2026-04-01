const fs = require("fs");
const path = require("path");
const metroTransformWorker = require("metro-transform-worker");
const { cssToReactNativeRuntime } = require("react-native-css-interop/css-to-rn");

async function transform(config, projectRoot, filename, data, options) {
  // Garantir que filename seja uma string antes de usar métodos de path ou string
  if (typeof filename !== 'string') {
    return metroTransformWorker.transform(config, projectRoot, filename, data, options);
  }

  const absolutePath = path.isAbsolute(filename) ? filename : path.resolve(projectRoot || "", filename);
  
  // Se for o arquivo de entrada do NativeWind (global.css)
  if (filename.endsWith("global.css") || absolutePath.endsWith("global.css")) {
    const platform = options.platform || "native";
    const cacheDir = path.join(projectRoot, "node_modules", ".cache", "nativewind");
    
    // Lista de possíveis nomes de arquivos gerados pelo NativeWind
    const possibleFiles = [
      `global.css.${platform}.css`,
      `global.css.native.css`,
      `global.css.css`,
      `global.css`
    ];

    let generatedCss = "";
    let foundPath = "";

    // Tenta encontrar o arquivo gerado
    for (const file of possibleFiles) {
      const fullPath = path.join(cacheDir, file);
      if (fs.existsSync(fullPath)) {
        generatedCss = fs.readFileSync(fullPath, "utf8");
        foundPath = fullPath;
        break;
      }
    }

    // Se não encontrou, tenta esperar um pouco (pode estar sendo gerado)
    if (!generatedCss) {
      for (let attempt = 0; attempt < 10; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        for (const file of possibleFiles) {
          const fullPath = path.join(cacheDir, file);
          if (fs.existsSync(fullPath)) {
            generatedCss = fs.readFileSync(fullPath, "utf8");
            foundPath = fullPath;
            break;
          }
        }
        if (generatedCss) break;
      }
    }

    if (generatedCss) {
      try {
        console.log(`[NativeWind] Found generated CSS at: ${foundPath}`);
        const runtimeData = JSON.stringify(cssToReactNativeRuntime(generatedCss));
        return metroTransformWorker.transform(
          config,
          projectRoot,
          filename,
          Buffer.from(`require("react-native-css-interop").StyleSheet.register(${runtimeData})`, "utf8"),
          options
        );
      } catch (e) {
        console.error(`[NativeWind] Error parsing CSS from ${foundPath}:`, e);
      }
    }
    
    // Se falhar em encontrar o CSS gerado, tenta retornar um CSS vazio para não quebrar o bundle
    console.warn(`[NativeWind] Warning: Generated CSS not found in ${cacheDir}. Returning empty styles.`);
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
