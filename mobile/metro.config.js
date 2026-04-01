const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");

// Garante que o diretório de cache do NativeWind existe para evitar erros de resolução em CI
// O NativeWind v4 gera arquivos no cache e depois tenta importá-los.
// Em ambientes de CI como o GitHub Actions, o cache pode estar vazio no início do bundling.
const cacheDir = path.join(__dirname, "node_modules", ".cache", "nativewind");
try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log("[MetroConfig] Criado diretório de cache do NativeWind:", cacheDir);
  }
  
  // Cria placeholders para as plataformas suportadas se não existirem
  ["android", "ios", "native"].forEach(platform => {
    const placeholderFile = path.join(cacheDir, `global.css.${platform}.css`);
    if (!fs.existsSync(placeholderFile)) {
      fs.writeFileSync(placeholderFile, "/* placeholder */");
      console.log(`[MetroConfig] Criado placeholder para ${platform}:`, placeholderFile);
    }
  });
} catch (e) {
  console.warn("[MetroConfig] Erro ao preparar cache do NativeWind:", e.message);
}

const config = getDefaultConfig(__dirname);

// Adiciona suporte para arquivos CSS no resolver (necessário para o NativeWind v4)
config.resolver.sourceExts.push("css");

module.exports = withNativeWind(config, { 
  input: "./global.css",
  inlineData: true // Tenta embutir os dados se possível para evitar problemas de resolução de arquivo
});
