#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Đọc package.json
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Tăng version
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
const newVersion = versionParts.join('.');

// Cập nhật package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

// Cập nhật service worker version
const swPath = path.join(__dirname, '../public/service-worker.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Tăng cache version
const versionMatch = swContent.match(/const CACHE_VERSION = 'v(\d+)';/);
if (versionMatch) {
  const currentCacheVersion = parseInt(versionMatch[1]);
  const newCacheVersion = currentCacheVersion + 1;
  swContent = swContent.replace(
    /const CACHE_VERSION = 'v\d+';/,
    `const CACHE_VERSION = 'v${newCacheVersion}';`
  );
  fs.writeFileSync(swPath, swContent);
}

// Tạo file version.json để force cache refresh
const versionJson = {
  version: newVersion,
  timestamp: new Date().toISOString(),
  buildId: Math.random().toString(36).substring(2, 15)
};

fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(versionJson, null, 2)
);

console.log(`✅ Version updated from ${currentVersion} to ${newVersion}`);
console.log(`✅ Cache version updated to v${newCacheVersion || 'new'}`);
console.log(`✅ Version file created`);

// Tạo build script
const buildScript = `
#!/bin/bash
echo "Building with version ${newVersion}..."

# Clear previous build
rm -rf dist

# Build the project
npm run build

# Copy version file to build
cp public/version.json dist/

echo "Build completed with version ${newVersion}"
`;

fs.writeFileSync(
  path.join(__dirname, 'build-with-version.sh'),
  buildScript
);

console.log(`✅ Build script created: scripts/build-with-version.sh`);
console.log(`\n🚀 To build with new version, run:`);
console.log(`   npm run build`);
console.log(`   or`);
console.log(`   ./scripts/build-with-version.sh`); 