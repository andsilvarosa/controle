const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Adiciona suporte para arquivos CSS no resolver
config.resolver.sourceExts.push("css");

// Configuração do NativeWind
const nativeWindConfig = withNativeWind(config, { 
  input: "./global.css",
  inlineData: true // Tenta embutir os dados se possível para evitar problemas de resolução de arquivo
});

// Sobrescreve o transformer para garantir que o global.css seja tratado corretamente
const originalTransformerPath = nativeWindConfig.transformer.babelTransformerPath;
nativeWindConfig.transformer.babelTransformerPath = require.resolve("./nativewind-transformer.js");

module.exports = nativeWindConfig;
