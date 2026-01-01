#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json to get version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Generate version manifest
const version = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
};

// Write to public/version.json
const publicDir = path.join(__dirname, '..', 'public');
const versionPath = path.join(publicDir, 'version.json');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(versionPath, JSON.stringify(version, null, 2) + '\n', 'utf8');

console.log(`✓ Generated version.json: ${version.version} (${version.buildTime})`);

