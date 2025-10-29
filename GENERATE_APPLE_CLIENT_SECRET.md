# Generate Apple Client Secret (JWT) for Supabase

**Issue:** Supabase shows "Secret Key (for OAuth)" field which requires a JWT token, not the raw private key.

**Solution:** You need to generate a **Client Secret (JWT)** from your private key using a script.

---

## What's Happening

Supabase's Apple Sign In configuration has changed. Instead of accepting the raw private key, it now requires a **pre-generated JWT token** (Client Secret).

### **What You Need:**
1. ✅ Team ID (from Apple Developer portal)
2. ✅ Services ID (e.g., `com.urbanmanual.auth`)
3. ✅ Key ID (from .p8 filename)
4. ✅ Private Key (.p8 file)
5. ✅ **Generate JWT** using these values

---

## Quick Solution (3 Methods)

### **Method 1: Use Python Script** (Recommended - Easiest)

#### **Step 1: Install Requirements**

```bash
pip3 install pyjwt cryptography
```

#### **Step 2: Edit the Script**

Open `/home/ubuntu/urban-manual/scripts/generate-apple-client-secret.py`

Update these values at the top:

```python
TEAM_ID = 'ABCD123456'                    # Your Team ID
SERVICES_ID = 'com.urbanmanual.auth'      # Your Services ID
KEY_ID = 'XXXXXXXXXX'                     # Your Key ID
PRIVATE_KEY_PATH = './AuthKey_XXXXXXXXXX.p8'  # Path to your .p8 file
```

#### **Step 3: Run the Script**

```bash
cd /home/ubuntu/urban-manual/scripts
python3 generate-apple-client-secret.py
```

#### **Step 4: Copy the JWT**

The script will output something like:

```
✅ Apple Client Secret Generated Successfully!

Your Client Secret (JWT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJFUzI1NiIsImtpZCI6IlhYWFhYWFhYWFgifQ.eyJpc3MiOiJBQkNEMTIzNDU2IiwiaWF0IjoxNzMwMTIzNDU2LCJleHAiOjE3NDU2NzU0NTYsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJjb20udXJiYW5tYW51YWwuYXV0aCJ9.abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Copy this entire JWT token!

---

### **Method 2: Use Node.js Script**

#### **Step 1: Install Requirements**

```bash
npm install jsonwebtoken
```

#### **Step 2: Edit the Script**

Open `/home/ubuntu/urban-manual/scripts/generate-apple-client-secret.js`

Update these values:

```javascript
const TEAM_ID = 'ABCD123456';
const SERVICES_ID = 'com.urbanmanual.auth';
const KEY_ID = 'XXXXXXXXXX';
const PRIVATE_KEY_PATH = './AuthKey_XXXXXXXXXX.p8';
```

#### **Step 3: Run the Script**

```bash
cd /home/ubuntu/urban-manual/scripts
node generate-apple-client-secret.js
```

#### **Step 4: Copy the JWT**

Same as Method 1 - copy the generated token!

---

### **Method 3: Use Online Tool** (Quick but less secure)

⚠️ **Warning:** Only use this for testing. Don't use with production keys!

1. **Go to:** https://jwt.io/
2. **Algorithm:** Select `ES256`
3. **Header:**
   ```json
   {
     "alg": "ES256",
     "kid": "XXXXXXXXXX"
   }
   ```
4. **Payload:**
   ```json
   {
     "iss": "ABCD123456",
     "iat": 1730123456,
     "exp": 1745675456,
     "aud": "https://appleid.apple.com",
     "sub": "com.urbanmanual.auth"
   }
   ```
5. **Private Key:** Paste your .p8 file content
6. **Copy the generated JWT**

**Note:** For `iat` and `exp`:
- `iat` = Current Unix timestamp (https://www.unixtimestamp.com/)
- `exp` = `iat` + 15552000 (180 days in seconds)

---

## Configure Supabase

### **Step 1: Go to Supabase**

```
1. Visit: https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk
2. Click: Authentication → Providers
3. Find: Apple
4. Toggle: Enable
```

### **Step 2: Fill in the Form**

```
Authorized Client IDs:
com.urbanmanual.auth

Secret Key (for OAuth):
[Paste the JWT token you generated]
```

### **Step 3: Save**

Click "Save" and you're done!

---

## What the JWT Contains

The JWT (Client Secret) is a signed token that contains:

```json
{
  "iss": "ABCD123456",              // Your Team ID
  "iat": 1730123456,                // Issued at (Unix timestamp)
  "exp": 1745675456,                // Expires at (Unix timestamp, 180 days later)
  "aud": "https://appleid.apple.com", // Audience (always this)
  "sub": "com.urbanmanual.auth"     // Your Services ID
}
```

Signed with your private key using ES256 algorithm.

---

## Important Notes

### **Token Expiration:**

⚠️ **The JWT expires after 180 days (6 months)**

You'll need to:
1. Regenerate the JWT before it expires
2. Update it in Supabase
3. Set a calendar reminder!

### **Security:**

✅ **DO:**
- Generate JWT on your local machine
- Keep private key secure
- Delete generated JWT file after use

❌ **DON'T:**
- Share your private key
- Commit JWT to git
- Use online tools with production keys

---

## Troubleshooting

### **Error: "Invalid client secret"**

**Cause:** JWT is malformed or expired

**Solution:**
- Regenerate the JWT
- Make sure you copied the entire token
- Check that `iat` and `exp` timestamps are correct

### **Error: "Algorithm not supported"**

**Cause:** Wrong algorithm used

**Solution:**
- Must use `ES256` algorithm
- Not `RS256` or `HS256`

### **Error: "Invalid issuer"**

**Cause:** Wrong Team ID

**Solution:**
- Check Team ID in Apple Developer portal (top right)
- Case-sensitive!

### **Error: "Invalid subject"**

**Cause:** Wrong Services ID

**Solution:**
- Use Services ID (e.g., `com.urbanmanual.auth`)
- NOT App ID (e.g., `com.urbanmanual.app`)

---

## Complete Example

### **Your Values:**

```
Team ID: A1B2C3D4E5
Services ID: com.urbanmanual.auth
Key ID: F6G7H8I9J0
Private Key: (in AuthKey_F6G7H8I9J0.p8)
```

### **Run Script:**

```bash
cd /home/ubuntu/urban-manual/scripts

# Edit the Python script first
nano generate-apple-client-secret.py

# Update the values:
# TEAM_ID = 'A1B2C3D4E5'
# SERVICES_ID = 'com.urbanmanual.auth'
# KEY_ID = 'F6G7H8I9J0'
# PRIVATE_KEY_PATH = './AuthKey_F6G7H8I9J0.p8'

# Run it
python3 generate-apple-client-secret.py
```

### **Output:**

```
✅ Apple Client Secret Generated Successfully!

Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team ID:      A1B2C3D4E5
Services ID:  com.urbanmanual.auth
Key ID:       F6G7H8I9J0
Issued At:    2025-10-28T10:00:00
Expires At:   2026-04-26T10:00:00
Valid For:    180 days (6 months)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Client Secret (JWT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJFUzI1NiIsImtpZCI6IkY2RzdIOEk5SjAifQ.eyJpc3MiOiJBMUIyQzNENEU1IiwiaWF0IjoxNzMwMTIzNDU2LCJleHAiOjE3NDU2NzU0NTYsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJjb20udXJiYW5tYW51YWwuYXV0aCJ9.MEUCIQDabcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Next Steps:
1. Copy the JWT token above
2. Go to Supabase Dashboard → Authentication → Providers → Apple
3. Paste the token in the "Secret Key (for OAuth)" field
4. Save

⚠️  Important: This token expires in 6 months. You'll need to regenerate it before then.

💾 Token also saved to: ./apple-client-secret.txt
```

### **Paste in Supabase:**

```
Authorized Client IDs:
com.urbanmanual.auth

Secret Key (for OAuth):
eyJhbGciOiJFUzI1NiIsImtpZCI6IkY2RzdIOEk5SjAifQ.eyJpc3MiOiJBMUIyQzNENEU1IiwiaWF0IjoxNzMwMTIzNDU2LCJleHAiOjE3NDU2NzU0NTYsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJjb20udXJiYW5tYW51YWwuYXV0aCJ9.MEUCIQDabcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

Click **Save** → Done!

---

## Automation (Optional)

### **Set Calendar Reminder:**

```
Reminder: Regenerate Apple Client Secret
Date: 6 months from today
Action: Run the script again and update Supabase
```

### **Or Use Environment Variable:**

```bash
# .env.local
APPLE_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsImtpZCI6...

# Update via script every 6 months
```

---

## Summary

### **Quick Steps:**

1. ✅ Install: `pip3 install pyjwt cryptography`
2. ✅ Edit: Update values in `generate-apple-client-secret.py`
3. ✅ Run: `python3 generate-apple-client-secret.py`
4. ✅ Copy: The generated JWT token
5. ✅ Paste: In Supabase "Secret Key (for OAuth)" field
6. ✅ Save: Done!

### **Remember:**

- Token expires in 6 months
- Set a reminder to regenerate
- Keep private key secure
- Don't commit JWT to git

---

## Need Help?

**Tell me:**
1. Which method did you try?
2. What error did you get?
3. Did the script run successfully?

I'll help you troubleshoot!

