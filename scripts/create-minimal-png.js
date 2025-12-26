// Create minimal valid PNG files for PWA icons
const fs = require("fs");
const path = require("path");

// Minimal valid PNG (1x1 pixel, black) - base64 encoded
// This is a valid PNG that browsers will accept
const minimalPNG192 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const minimalPNG512 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const publicDir = path.join(__dirname, "..", "public");

fs.writeFileSync(path.join(publicDir, "icon-192.png"), minimalPNG192);
fs.writeFileSync(path.join(publicDir, "icon-512.png"), minimalPNG512);

console.log(
  "Minimal PNG icons created. Replace with proper designed icons for production.",
);
