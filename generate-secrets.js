#!/usr/bin/env node

/**
 * Generate Secure Secrets for Environment Variables
 * 
 * Run this script to generate secure random strings for:
 * - SESSION_SECRET
 * - JWT_SECRET
 * 
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n=================================================');
console.log('🔐 ECL Global - Secure Secret Generator');
console.log('=================================================\n');

console.log('Copy these values to your .env file or Render environment variables:\n');

console.log('SESSION_SECRET:');
console.log(generateSecret(32));
console.log('');

console.log('JWT_SECRET:');
console.log(generateSecret(32));
console.log('');

console.log('=================================================');
console.log('⚠️  Keep these secrets safe and never commit them!');
console.log('=================================================\n');
