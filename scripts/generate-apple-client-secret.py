#!/usr/bin/env python3

"""
Generate Apple Client Secret (JWT) for Supabase

This script generates a JWT token that Supabase needs for Apple Sign In.
The JWT is valid for 6 months and needs to be regenerated periodically.

Usage:
    python3 generate-apple-client-secret.py

Requirements:
    pip3 install pyjwt cryptography
"""

import jwt
import time
from datetime import datetime, timedelta
import os

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================

TEAM_ID = 'YOUR_TEAM_ID'           # e.g., 'ABCD123456'
SERVICES_ID = 'YOUR_SERVICES_ID'   # e.g., 'com.urbanmanual.auth'
KEY_ID = 'YOUR_KEY_ID'             # e.g., 'XXXXXXXXXX'
PRIVATE_KEY_PATH = './AuthKey_XXXXXXXXXX.p8'  # Path to your .p8 file

# ============================================
# SCRIPT - DO NOT MODIFY BELOW THIS LINE
# ============================================

def generate_client_secret():
    try:
        # Validate configuration
        if (TEAM_ID == 'YOUR_TEAM_ID' or 
            SERVICES_ID == 'YOUR_SERVICES_ID' or 
            KEY_ID == 'YOUR_KEY_ID'):
            print('❌ Error: Please update the configuration values at the top of this script!')
            print('\nYou need to set:')
            print('- TEAM_ID (from Apple Developer portal, top right)')
            print('- SERVICES_ID (e.g., com.urbanmanual.auth)')
            print('- KEY_ID (from your .p8 filename)')
            print('- PRIVATE_KEY_PATH (path to your .p8 file)')
            exit(1)

        # Read private key
        if not os.path.exists(PRIVATE_KEY_PATH):
            print(f'❌ Error: Private key file not found at: {PRIVATE_KEY_PATH}')
            print('\nMake sure the PRIVATE_KEY_PATH points to your .p8 file.')
            exit(1)

        with open(PRIVATE_KEY_PATH, 'r') as f:
            private_key = f.read()

        # Generate JWT
        now = int(time.time())
        expiration_time = now + (86400 * 180)  # 180 days (6 months)

        headers = {
            'kid': KEY_ID,
            'alg': 'ES256'
        }

        payload = {
            'iss': TEAM_ID,
            'iat': now,
            'exp': expiration_time,
            'aud': 'https://appleid.apple.com',
            'sub': SERVICES_ID,
        }

        token = jwt.encode(
            payload,
            private_key,
            algorithm='ES256',
            headers=headers
        )

        # Display results
        print('✅ Apple Client Secret Generated Successfully!\n')
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        print('Configuration:')
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        print(f'Team ID:      {TEAM_ID}')
        print(f'Services ID:  {SERVICES_ID}')
        print(f'Key ID:       {KEY_ID}')
        print(f'Issued At:    {datetime.fromtimestamp(now).isoformat()}')
        print(f'Expires At:   {datetime.fromtimestamp(expiration_time).isoformat()}')
        print(f'Valid For:    180 days (6 months)')
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        
        print('Your Client Secret (JWT):')
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        print(token)
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        
        print('📋 Next Steps:')
        print('1. Copy the JWT token above')
        print('2. Go to Supabase Dashboard → Authentication → Providers → Apple')
        print('3. Paste the token in the "Secret Key (for OAuth)" field')
        print('4. Save')
        print('\n⚠️  Important: This token expires in 6 months. You\'ll need to regenerate it before then.\n')

        # Save to file
        output_path = './apple-client-secret.txt'
        with open(output_path, 'w') as f:
            f.write(token)
        print(f'💾 Token also saved to: {os.path.abspath(output_path)}\n')

    except Exception as error:
        print(f'❌ Error generating client secret: {str(error)}')
        exit(1)

# Run the script
if __name__ == '__main__':
    generate_client_secret()

