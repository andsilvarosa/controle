const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const SIZE = 1024;
const ASSETS_DIR = path.resolve(__dirname, "..", "assets");

const COLORS = {
  transparent: [0, 0, 0, 0],
  white: [255, 255, 255, 255],
  teal: [17, 199, 111, 255],
};

function createPng(background = COLORS.transparent) {
  const png = new PNG({ width: SIZE, height: SIZE });
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      setPixel(png, x, y, background);
    }
  }
  return png;
}

function setPixel(png, x, y, [r, g, b, a]) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const index = (png.width * y + x) << 2;
  png.data[index] = r;
  png.data[index + 1] = g;
  png.data[index + 2] = b;
  png.data[index + 3] = a;
}

function fillRect(png, color) {
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      setPixel(png, x, y, color);
    }
  }
}

function drawFilledCircle(png, centerX, centerY, radius, color) {
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(png.width - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(png.height - 1, Math.ceil(centerY + radius));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      if ((dx * dx) + (dy * dy) <= radius * radius) {
        setPixel(png, x, y, color);
      }
    }
  }
}

function drawRoundedRect(png, x, y, width, height, radius, color) {
  const maxX = x + width;
  const maxY = y + height;

  for (let py = y; py < maxY; py += 1) {
    for (let px = x; px < maxX; px += 1) {
      const clampedX = Math.max(x + radius, Math.min(px, maxX - radius));
      const clampedY = Math.max(y + radius, Math.min(py, maxY - radius));
      const dx = px - clampedX;
      const dy = py - clampedY;
      if ((dx * dx) + (dy * dy) <= radius * radius) {
        setPixel(png, px, py, color);
      }
    }
  }
}

function cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: (mt2 * mt * p0.x) + (3 * mt2 * t * p1.x) + (3 * mt * t2 * p2.x) + (t2 * t * p3.x),
    y: (mt2 * mt * p0.y) + (3 * mt2 * t * p1.y) + (3 * mt * t2 * p2.y) + (t2 * t * p3.y),
  };
}

function drawStrokeFromCubics(png, segments, radius, color) {
  for (const segment of segments) {
    for (let step = 0; step <= 120; step += 1) {
      const point = cubicPoint(segment[0], segment[1], segment[2], segment[3], step / 120);
      drawFilledCircle(png, point.x, point.y, radius, color);
    }
  }
}

function scalePoint(x, y) {
  const factor = SIZE / 100;
  return { x: x * factor, y: y * factor };
}

function drawMainMark(png, { includeCard = true, monochrome = false, transparent = false } = {}) {
  if (includeCard) {
    drawRoundedRect(png, 102, 102, 820, 820, 220, COLORS.white);
  }

  if (!monochrome) {
    drawFilledCircle(png, 512, 512, 368, COLORS.teal);
  }

  const strokeColor = monochrome ? COLORS.white : COLORS.white;
  const curves = [
    [scalePoint(38, 45), scalePoint(38, 41), scalePoint(42, 38), scalePoint(50, 38)],
    [scalePoint(50, 38), scalePoint(58, 38), scalePoint(62, 41), scalePoint(62, 45)],
    [scalePoint(62, 45), scalePoint(62, 49), scalePoint(58, 50.5), scalePoint(50, 53)],
    [scalePoint(50, 53), scalePoint(42, 55.5), scalePoint(38, 57), scalePoint(38, 61)],
    [scalePoint(38, 61), scalePoint(38, 65), scalePoint(42, 68), scalePoint(50, 68)],
    [scalePoint(50, 68), scalePoint(58, 68), scalePoint(62, 65), scalePoint(62, 61)],
  ];

  drawStrokeFromCubics(png, curves, 36, strokeColor);

  if (!monochrome) {
    drawFilledCircle(png, 696, 328, 52, COLORS.white);
  }

  if (transparent) {
    // Keeps only the inner mark visually centered for adaptive icon foreground.
    return;
  }
}

function writePng(fileName, png) {
  const outputPath = path.join(ASSETS_DIR, fileName);
  fs.writeFileSync(outputPath, PNG.sync.write(png));
  console.log(`generated ${fileName}`);
}

function generate() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const brandedIcon = createPng(COLORS.transparent);
  drawMainMark(brandedIcon, { includeCard: true });
  writePng("icon.png", brandedIcon);
  writePng("favicon.png", brandedIcon);
  writePng("splash-icon.png", brandedIcon);

  const adaptiveBackground = createPng(COLORS.white);
  fillRect(adaptiveBackground, COLORS.white);
  writePng("android-icon-background.png", adaptiveBackground);

  const adaptiveForeground = createPng(COLORS.transparent);
  drawMainMark(adaptiveForeground, { includeCard: false, transparent: true });
  writePng("android-icon-foreground.png", adaptiveForeground);

  const monochrome = createPng(COLORS.transparent);
  drawMainMark(monochrome, { includeCard: false, monochrome: true, transparent: true });
  writePng("android-icon-monochrome.png", monochrome);
}

generate();
