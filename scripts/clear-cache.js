#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing cache and forcing refresh...');

// Tạo file timestamp để force cache refresh
const timestamp = new Date().toISOString();
const cacheBuster = {
  timestamp,
  buildId: Math.random().toString(36).substring(2, 15),
  message: 'Cache busting file - do not cache this'
};

// Tạo file cache buster
fs.writeFileSync(
  path.join(__dirname, '../public/cache-buster.json'),
  JSON.stringify(cacheBuster, null, 2)
);

// Cập nhật service worker version
const swPath = path.join(__dirname, '../public/service-worker.js');
if (fs.existsSync(swPath)) {
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
    console.log(`✅ Service Worker cache version updated to v${newCacheVersion}`);
  }
}

// Tạo file version.json mới
const versionJson = {
  version: require('../package.json').version,
  timestamp,
  buildId: cacheBuster.buildId,
  cacheBuster: true
};

fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(versionJson, null, 2)
);

console.log('✅ Cache buster files created');
console.log('✅ Service Worker cache version updated');
console.log('✅ Version file updated');

// Tạo instructions cho user
console.log('\n📋 Instructions for users:');
console.log('1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
console.log('2. Clear browser cache: Ctrl+Shift+Delete');
console.log('3. Use incognito/private mode to test');
console.log('4. Clear service worker: DevTools > Application > Service Workers > Unregister');

console.log('\n🚀 Next steps:');
console.log('1. Deploy the updated files to your server');
console.log('2. Users will automatically get the new version');
console.log('3. If issues persist, ask users to clear their browser cache'); 