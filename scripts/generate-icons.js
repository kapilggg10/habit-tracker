// Simple script to generate placeholder PWA icons
// In production, replace these with proper designed icons

const fs = require("fs");
const path = require("path");

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#171717"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.4}" fill="white" text-anchor="middle" dominant-baseline="middle">✓</text>
</svg>`;
};

const publicDir = path.join(__dirname, "..", "public");

// Create SVG icons (can be converted to PNG later)
fs.writeFileSync(path.join(publicDir, "icon.svg"), createSVGIcon(512));

console.log("Icon SVG created. For production, convert to PNG format:");
console.log("  - icon-192.png (192x192)");
console.log("  - icon-512.png (512x512)");
console.log(
  "You can use online tools or ImageMagick: convert icon.svg -resize 192x192 icon-192.png",
);
