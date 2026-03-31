const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const requiredFiles = [
  "icon.png",
  "favicon.png",
  "splash-icon.png",
  "android-icon-background.png",
  "android-icon-foreground.png",
  "android-icon-monochrome.png",
];

const assetsDir = path.resolve(__dirname, "..", "assets");

for (const file of requiredFiles) {
  const fullPath = path.join(assetsDir, file);
  console.log(`Verifying asset: ${file}`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing asset: ${file}`);
  }

  const buffer = fs.readFileSync(fullPath);
  const png = PNG.sync.read(buffer);
  if (!png.width || !png.height) {
    throw new Error(`Invalid PNG dimensions: ${file}`);
  }
}

console.log("All mobile assets are valid PNG files.");
