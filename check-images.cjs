const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'mobile', 'assets');
const files = fs.readdirSync(assetsDir);

for (const file of files) {
  if (file.endsWith('.png')) {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`${file}: ${stats.size} bytes`);
    
    // Read first few bytes to check signature
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);
    
    console.log(`  Signature: ${buffer.toString('hex')}`);
  }
}
