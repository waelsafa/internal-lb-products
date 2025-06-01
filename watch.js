#!/usr/bin/env node

const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

console.log('🔍 Watching for changes in _products folder...');

// Watch markdown files in _products folder
const watcher = chokidar.watch('_products/*.md', {
  persistent: true,
  ignoreInitial: false
});

watcher.on('change', (filePath) => {
  console.log(`📝 File changed: ${filePath}`);
  rebuildData();
});

watcher.on('add', (filePath) => {
  console.log(`➕ File added: ${filePath}`);
  rebuildData();
});

watcher.on('unlink', (filePath) => {
  console.log(`🗑️  File deleted: ${filePath}`);
  rebuildData();
});

function rebuildData() {
  console.log('🔄 Rebuilding products.json...');
  exec('node build.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Build error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  Build warning: ${stderr}`);
    }
    console.log('✅ Products.json updated successfully');
    if (stdout) {
      console.log(stdout);
    }
  });
}

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  watcher.close();
  process.exit(0);
});
