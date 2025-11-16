#!/usr/bin/env node
/**
 * WordPress Application Password Generator
 *
 * Generates random application passwords for WordPress REST API authentication.
 * These passwords can be used instead of user passwords for enhanced security.
 *
 * Usage: npm run generate-keys
 */

const crypto = require('crypto');

/**
 * Generate a secure random application password
 * Format: XXXX XXXX XXXX XXXX XXXX XXXX (24 characters in 6 groups)
 */
function generateApplicationPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const groups = 6;
  const charsPerGroup = 4;
  const password = [];

  for (let i = 0; i < groups; i++) {
    let group = '';
    for (let j = 0; j < charsPerGroup; j++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      group += chars[randomIndex];
    }
    password.push(group);
  }

  return password.join(' ');
}

/**
 * Generate a secure API key for webhook signatures
 */
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

console.log('🔑 WordPress ONE Platform Security Keys\n');
console.log('━'.repeat(60));

console.log('\n📝 Application Password (for WordPress user):');
console.log('   ' + generateApplicationPassword());
console.log('\n   How to use:');
console.log('   1. Go to: WordPress Admin → Users → Your Profile');
console.log('   2. Scroll to "Application Passwords"');
console.log('   3. Enter name: "ONE Platform Integration"');
console.log('   4. Click "Add New Application Password"');
console.log('   5. Copy the generated password (or use the one above)');

console.log('\n🔐 API Key (for webhook signatures):');
console.log('   ' + generateApiKey());
console.log('\n   How to use:');
console.log('   1. Go to: WordPress Admin → ONE Platform → Settings');
console.log('   2. Paste this key in "API Key" field');
console.log('   3. Save settings');

console.log('\n🌐 Environment Variables (.env):');
console.log('   WORDPRESS_URL=https://your-wordpress-site.com');
console.log('   WORDPRESS_USERNAME=your-admin-username');
console.log('   WORDPRESS_APP_PASSWORD=' + generateApplicationPassword().replace(/ /g, ''));
console.log('   WORDPRESS_API_KEY=' + generateApiKey());

console.log('\n━'.repeat(60));
console.log('\n✅ Keys generated successfully!');
console.log('⚠️  Store these keys securely and never commit them to git\n');
