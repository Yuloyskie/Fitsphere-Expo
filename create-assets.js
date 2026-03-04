const fs = require('fs');
const path = require('path');

// Simple 1x1 transparent PNG
const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the PNG files
const files = ['icon.png', 'splash-icon.png', 'adaptive-icon.png', 'favicon.png'];
files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, png1x1);
  console.log(`Created ${file}`);
});

console.log('All assets created successfully!');
