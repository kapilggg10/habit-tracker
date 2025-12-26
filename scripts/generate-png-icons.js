const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const publicDir = path.join(__dirname, '..', 'public');

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 192x192 PNG
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    // Generate 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    // Generate favicon (32x32 PNG, browsers support PNG favicons)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('Icons generated successfully!');
    console.log('- icon-192.png (192x192)');
    console.log('- icon-512.png (512x512)');
    console.log('- favicon.ico (32x32)');
  } catch (error) {
    console.error('Error generating PNG icons:', error);
  }
}

generateIcons();
