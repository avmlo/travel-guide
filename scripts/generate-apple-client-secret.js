#!/usr/bin/env node

/**
 * Generate Apple Client Secret (JWT) for Supabase
 * 
 * This script generates a JWT token that Supabase needs for Apple Sign In.
 * The JWT is valid for 6 months and needs to be regenerated periodically.
 * 
 * Usage:
 *   node generate-apple-client-secret.js
 * 
 * Requirements:
 *   npm install jsonwebtoken
 */

const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const TEAM_ID = 'YOUR_TEAM_ID';           // e.g., 'ABCD123456'
const SERVICES_ID = 'YOUR_SERVICES_ID';   // e.g., 'com.urbanmanual.auth'
const KEY_ID = 'YOUR_KEY_ID';             // e.g., 'XXXXXXXXXX'
const PRIVATE_KEY_PATH = './AuthKey_XXXXXXXXXX.p8'; // Path to your .p8 file

// ============================================
// SCRIPT - DO NOT MODIFY BELOW THIS LINE
// ============================================

function generateClientSecret() {
  try {
    // Validate configuration
    if (TEAM_ID === 'YOUR_TEAM_ID' || 
        SERVICES_ID === 'YOUR_SERVICES_ID' || 
        KEY_ID === 'YOUR_KEY_ID') {
      console.error('❌ Error: Please update the configuration values at the top of this script!');
      console.log('\nYou need to set:');
      console.log('- TEAM_ID (from Apple Developer portal, top right)');
      console.log('- SERVICES_ID (e.g., com.urbanmanual.auth)');
      console.log('- KEY_ID (from your .p8 filename)');
      console.log('- PRIVATE_KEY_PATH (path to your .p8 file)');
      process.exit(1);
    }

    // Read private key
    const privateKeyPath = path.resolve(PRIVATE_KEY_PATH);
    
    if (!fs.existsSync(privateKeyPath)) {
      console.error(`❌ Error: Private key file not found at: ${privateKeyPath}`);
      console.log('\nMake sure the PRIVATE_KEY_PATH points to your .p8 file.');
      process.exit(1);
    }

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    // Generate JWT
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = now + (86400 * 180); // 180 days (6 months)

    const payload = {
      iss: TEAM_ID,
      iat: now,
      exp: expirationTime,
      aud: 'https://appleid.apple.com',
      sub: SERVICES_ID,
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: KEY_ID,
    });

    // Display results
    console.log('✅ Apple Client Secret Generated Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Team ID:      ${TEAM_ID}`);
    console.log(`Services ID:  ${SERVICES_ID}`);
    console.log(`Key ID:       ${KEY_ID}`);
    console.log(`Issued At:    ${new Date(now * 1000).toISOString()}`);
    console.log(`Expires At:   ${new Date(expirationTime * 1000).toISOString()}`);
    console.log(`Valid For:    180 days (6 months)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Your Client Secret (JWT):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(token);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Copy the JWT token above');
    console.log('2. Go to Supabase Dashboard → Authentication → Providers → Apple');
    console.log('3. Paste the token in the "Secret Key (for OAuth)" field');
    console.log('4. Save');
    console.log('\n⚠️  Important: This token expires in 6 months. You\'ll need to regenerate it before then.\n');

    // Save to file
    const outputPath = path.resolve('./apple-client-secret.txt');
    fs.writeFileSync(outputPath, token);
    console.log(`💾 Token also saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Error generating client secret:', error.message);
    process.exit(1);
  }
}

// Run the script
generateClientSecret();

