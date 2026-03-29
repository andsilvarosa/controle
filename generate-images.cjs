const Jimp = require('jimp');
const path = require('path');

async function createImages() {
  const assetsDir = path.join(__dirname, 'mobile', 'assets');
  
  // Create a 1024x1024 blue icon
  const icon = new Jimp(1024, 1024, 0x0000FFFF);
  await icon.writeAsync(path.join(assetsDir, 'icon.png'));
  
  // Create a 1024x1024 blue foreground
  const fg = new Jimp(1024, 1024, 0x0000FFFF);
  await fg.writeAsync(path.join(assetsDir, 'android-icon-foreground.png'));
  
  // Create a 1024x1024 white background
  const bg = new Jimp(1024, 1024, 0xFFFFFFFF);
  await bg.writeAsync(path.join(assetsDir, 'android-icon-background.png'));
  
  // Create a 1242x2436 blue splash
  const splash = new Jimp(1242, 2436, 0x0000FFFF);
  await splash.writeAsync(path.join(assetsDir, 'splash-icon.png'));

  // Create a 192x192 blue favicon
  const favicon = new Jimp(192, 192, 0x0000FFFF);
  await favicon.writeAsync(path.join(assetsDir, 'favicon.png'));
  
  // Create a 1024x1024 monochrome
  const mono = new Jimp(1024, 1024, 0xFFFFFFFF);
  await mono.writeAsync(path.join(assetsDir, 'android-icon-monochrome.png'));
  
  console.log('Images generated successfully.');
}

createImages().catch(console.error);
