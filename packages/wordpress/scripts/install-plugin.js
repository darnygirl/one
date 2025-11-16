#!/usr/bin/env node
/**
 * WordPress Plugin Installation Script
 *
 * Usage: node install-plugin.js /path/to/wordpress
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const wpPath = process.argv[2];

if (!wpPath) {
  console.error('❌ Error: WordPress path required');
  console.log('\nUsage: npm run install-wp-plugin -- /path/to/wordpress');
  process.exit(1);
}

const pluginsDir = path.join(wpPath, 'wp-content', 'plugins');

if (!fs.existsSync(pluginsDir)) {
  console.error(`❌ Error: WordPress plugins directory not found at ${pluginsDir}`);
  console.log('\nPlease provide the correct WordPress installation path.');
  process.exit(1);
}

const packageDir = path.join(__dirname, '..');
const pluginSource = path.join(packageDir, 'plugin', 'one-platform-connector');
const pluginDest = path.join(pluginsDir, 'one-platform-connector');

console.log('🚀 Installing ONE Platform Connector Plugin...\n');
console.log(`Source: ${pluginSource}`);
console.log(`Destination: ${pluginDest}\n`);

// Remove existing plugin if present
if (fs.existsSync(pluginDest)) {
  console.log('⚠️  Existing plugin found, removing...');
  fs.rmSync(pluginDest, { recursive: true, force: true });
}

// Copy plugin
console.log('📦 Copying plugin files...');
fs.cpSync(pluginSource, pluginDest, { recursive: true });

console.log('✅ Plugin installed successfully!\n');
console.log('Next steps:');
console.log('1. Activate the plugin:');
console.log('   wp plugin activate one-platform-connector');
console.log('\n2. Or activate via WordPress admin:');
console.log('   Plugins → ONE Platform Connector → Activate');
console.log('\n3. Configure settings:');
console.log('   ONE Platform → Settings\n');
