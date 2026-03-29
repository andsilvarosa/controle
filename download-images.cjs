const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, 'mobile', 'assets');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function fixImages() {
  const files = [
    'icon.png',
    'android-icon-foreground.png',
    'android-icon-background.png',
    'splash-icon.png',
    'favicon.png',
    'android-icon-monochrome.png'
  ];
  
  // A simple 1024x1024 blue square from a reliable source or just a placeholder service
  const url = 'https://placehold.co/1024x1024/0000FF/0000FF.png';
  
  for (const file of files) {
    const dest = path.join(assetsDir, file);
    console.log(`Downloading to ${dest}...`);
    await download(url, dest);
  }
  
  console.log('All images replaced successfully.');
}

fixImages().catch(console.error);
