/**
 * Test script to verify Google OAuth configuration
 * Run with: node test-google-oauth.js
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    value = value.replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

console.log('\n🔍 Checking Google OAuth Configuration...\n');

const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

let hasErrors = false;

// Check Client ID
if (!clientId) {
  console.log('❌ GOOGLE_CLIENT_ID is not set');
  hasErrors = true;
} else if (!clientId.endsWith('.apps.googleusercontent.com')) {
  console.log('⚠️  GOOGLE_CLIENT_ID format looks incorrect');
  console.log('   Expected format: xxxxx.apps.googleusercontent.com');
  console.log('   Got:', clientId);
  hasErrors = true;
} else {
  console.log('✅ GOOGLE_CLIENT_ID is set correctly');
  console.log('   Value:', clientId.substring(0, 20) + '...');
}

// Check Client Secret
if (!clientSecret) {
  console.log('❌ GOOGLE_CLIENT_SECRET is not set');
  hasErrors = true;
} else if (!clientSecret.startsWith('GOCSPX-')) {
  console.log('⚠️  GOOGLE_CLIENT_SECRET format looks incorrect');
  console.log('   Expected format: GOCSPX-xxxxx');
  console.log('   Got:', clientSecret.substring(0, 10) + '...');
  hasErrors = true;
} else {
  console.log('✅ GOOGLE_CLIENT_SECRET is set correctly');
  console.log('   Value:', clientSecret.substring(0, 15) + '...');
}

// Check App URL
console.log('\n📍 Configuration:');
console.log('   App URL:', appUrl);
console.log('   Redirect URI:', `${appUrl}/api/auth/google/callback`);

console.log('\n📋 Required Google Console Settings:');
console.log('   1. Authorized JavaScript origins:');
console.log('      -', appUrl);
console.log('   2. Authorized redirect URIs:');
console.log('      -', `${appUrl}/api/auth/google/callback`);

if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix them and try again.\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good!\n');
  console.log('Next steps:');
  console.log('1. Make sure the redirect URI is added in Google Console');
  console.log('2. Restart your dev server: npm run dev');
  console.log('3. Test Google Sign-In at: ' + appUrl + '/signin\n');
}
