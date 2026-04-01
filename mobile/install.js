const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running npm install in mobile directory...');
  execSync('npm install --package-lock-only --legacy-peer-deps', {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });
  console.log('Success!');
} catch (error) {
  console.error('Error running npm install:', error.message);
  process.exit(1);
}
