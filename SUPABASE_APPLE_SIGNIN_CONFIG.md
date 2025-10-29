# Supabase Apple Sign In Configuration Guide

**Issue:** Supabase asks for "JWT" but you have a `.p8` private key file from Apple.

**Answer:** Supabase wants the **private key content** (from the .p8 file), NOT a JWT. Supabase will generate the JWT automatically using your private key.

---

## What Supabase Needs

When you enable Apple Sign In in Supabase, you need to provide **4 things**:

1. **Services ID** (e.g., `com.urbanmanual.auth`)
2. **Team ID** (e.g., `ABCD123456`)
3. **Key ID** (e.g., `XXXXXXXXXX`)
4. **Private Key** (the content of your `.p8` file)

---

## Step-by-Step Configuration

### **Step 1: Locate Your Private Key File**

After downloading from Apple Developer portal, you should have:
```
AuthKey_XXXXXXXXXX.p8
```

Where `XXXXXXXXXX` is your **Key ID**.

### **Step 2: Open the .p8 File**

**On Mac:**
```bash
cat ~/Downloads/AuthKey_XXXXXXXXXX.p8
```

**On Windows:**
```powershell
notepad AuthKey_XXXXXXXXXX.p8
```

**Or:** Just open it with any text editor (TextEdit, Notepad, VS Code, etc.)

### **Step 3: Copy the ENTIRE Content**

The file should look like this:

```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg1234567890abcdef
1234567890abcdef1234567890abcdef1234567890abcdefgCgYIKoZIzj0DAQeh
RANCAAQabcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTU
VWXYZabcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVW
XYZ1234567890abcdefghijklmnopqrstuvwxyz
-----END PRIVATE KEY-----
```

**IMPORTANT:** Copy **EVERYTHING**, including:
- `-----BEGIN PRIVATE KEY-----`
- All the random characters in the middle
- `-----END PRIVATE KEY-----`

### **Step 4: Go to Supabase Dashboard**

1. **Open Supabase:**
   ```
   https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk
   ```

2. **Navigate to Authentication:**
   ```
   Click: Authentication (left sidebar)
   Click: Providers (tab at top)
   ```

3. **Find Apple:**
   ```
   Scroll down to find "Apple"
   Toggle: Enable
   ```

### **Step 5: Fill in the Form**

Now you'll see a form with these fields:

#### **Field 1: Services ID**
```
Services ID: com.urbanmanual.auth

This is the Services ID you created in Apple Developer portal
(NOT the App ID!)
```

#### **Field 2: Team ID**
```
Team ID: ABCD123456

Where to find it:
1. Go to: https://developer.apple.com/account
2. Look at top right corner
3. You'll see your name and below it: "Team ID: ABCD123456"
```

#### **Field 3: Key ID**
```
Key ID: XXXXXXXXXX

This is from your .p8 filename:
AuthKey_XXXXXXXXXX.p8
          ^^^^^^^^^^
          This part!
```

#### **Field 4: Private Key**
```
Private Key:
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg1234567890abcdef
1234567890abcdef1234567890abcdef1234567890abcdefgCgYIKoZIzj0DAQeh
RANCAAQabcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTU
VWXYZabcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVW
XYZ1234567890abcdefghijklmnopqrstuvwxyz
-----END PRIVATE KEY-----

Paste the ENTIRE content of your .p8 file here!
```

### **Step 6: Save**

Click **"Save"** button at the bottom.

You should see:
```
✅ Apple provider enabled
```

---

## Visual Guide

### **What the Supabase Form Looks Like:**

```
┌─────────────────────────────────────────────────┐
│ Apple Sign In Configuration                     │
├─────────────────────────────────────────────────┤
│                                                 │
│ Enabled: [✓]                                    │
│                                                 │
│ Services ID *                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ com.urbanmanual.auth                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Team ID *                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ ABCD123456                                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Key ID *                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ XXXXXXXXXX                                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Private Key *                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ -----BEGIN PRIVATE KEY-----                 │ │
│ │ MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkw│ │
│ │ dwIBAQQg1234567890abcdef1234567890abcdef│ │
│ │ ...                                         │ │
│ │ -----END PRIVATE KEY-----                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Cancel]                            [Save]      │
└─────────────────────────────────────────────────┘
```

---

## Common Mistakes

### **Mistake 1: Using App ID Instead of Services ID**

```
❌ WRONG:
Services ID: com.urbanmanual.app (This is your App ID!)

✅ CORRECT:
Services ID: com.urbanmanual.auth (This is your Services ID!)
```

### **Mistake 2: Not Including BEGIN/END Lines**

```
❌ WRONG:
Private Key:
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...

✅ CORRECT:
Private Key:
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
```

### **Mistake 3: Adding Extra Spaces or Line Breaks**

```
❌ WRONG:
-----BEGIN PRIVATE KEY-----

MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...

-----END PRIVATE KEY-----

✅ CORRECT:
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
```

### **Mistake 4: Wrong Key ID**

```
❌ WRONG:
Key ID: AuthKey_XXXXXXXXXX.p8 (filename!)

✅ CORRECT:
Key ID: XXXXXXXXXX (just the 10-character ID)
```

---

## Where to Find Each Value

| Field | Where to Find It | Example |
|-------|------------------|---------|
| **Services ID** | Apple Developer → Identifiers → Your Services ID | `com.urbanmanual.auth` |
| **Team ID** | Apple Developer → Top right corner | `ABCD123456` |
| **Key ID** | Filename of .p8 file: `AuthKey_[KEY_ID].p8` | `XXXXXXXXXX` |
| **Private Key** | Content of .p8 file (open with text editor) | `-----BEGIN PRIVATE KEY-----\n...` |

---

## About JWT (Why You Don't Need to Generate It)

### **What's Happening Behind the Scenes:**

1. **You provide:** Private key (.p8 content)
2. **Supabase generates:** JWT token using your private key
3. **Supabase sends:** JWT to Apple for authentication
4. **Apple validates:** JWT and returns user info
5. **Supabase creates:** User session

**You don't need to generate the JWT yourself!** Supabase does it automatically.

### **Technical Details (FYI):**

When a user signs in with Apple:

```
User clicks "Sign in with Apple"
    ↓
Supabase generates JWT using:
    - Your private key
    - Your Team ID
    - Your Key ID
    - Current timestamp
    ↓
Supabase sends JWT to Apple
    ↓
Apple validates JWT
    ↓
Apple returns user info
    ↓
Supabase creates user session
    ↓
User is signed in!
```

---

## Verification

### **After saving, verify it worked:**

1. **Check Provider Status:**
   ```
   Go to: Authentication → Providers
   Apple should show: ✅ Enabled
   ```

2. **Check Callback URL:**
   ```
   The callback URL should be:
   https://avdnefdfwvpjkuanhdwk.supabase.co/auth/v1/callback
   
   Make sure this matches what you entered in Apple Developer portal!
   ```

3. **Test Sign In:**
   ```
   Create a test page with Apple Sign In button
   Click it
   Should redirect to Apple's sign-in page
   After signing in, should redirect back to your app
   ```

---

## Quick Reference Card

### **Copy This Template:**

```
Services ID: com.urbanmanual.auth
Team ID: [Find in Apple Developer portal, top right]
Key ID: [From .p8 filename: AuthKey_XXXXXXXXXX.p8]
Private Key:
-----BEGIN PRIVATE KEY-----
[Paste entire content from .p8 file]
-----END PRIVATE KEY-----
```

---

## Troubleshooting

### **Error: "Invalid private key"**

**Cause:** Private key format is wrong

**Solution:**
- Make sure you copied the ENTIRE key including BEGIN/END lines
- No extra spaces or line breaks
- No missing characters

### **Error: "Invalid Services ID"**

**Cause:** Using wrong identifier

**Solution:**
- Use Services ID (e.g., `com.urbanmanual.auth`)
- NOT App ID (e.g., `com.urbanmanual.app`)

### **Error: "Invalid Team ID"**

**Cause:** Wrong Team ID

**Solution:**
- Check top right of Apple Developer portal
- Should be 10 characters (letters and numbers)
- Case-sensitive!

### **Error: "Invalid Key ID"**

**Cause:** Wrong Key ID

**Solution:**
- Check .p8 filename: `AuthKey_XXXXXXXXXX.p8`
- Use only the 10-character part
- Case-sensitive!

---

## Security Best Practices

### **Protect Your Private Key:**

```bash
# ❌ NEVER commit to git
echo "AuthKey_*.p8" >> .gitignore

# ❌ NEVER share publicly
# ❌ NEVER paste in public forums

# ✅ Store securely
# ✅ Only paste in Supabase dashboard (secure)
# ✅ Keep backup in password manager
```

### **If Key is Compromised:**

1. **Revoke the key** in Apple Developer portal
2. **Generate new key**
3. **Update Supabase** with new key
4. **Delete old key** from Apple

---

## Complete Example

### **Example Values (Fake, for reference):**

```
Services ID: com.urbanmanual.auth
Team ID: A1B2C3D4E5
Key ID: F6G7H8I9J0

Private Key:
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgK1L2M3N4O5P6Q7R8
S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0
Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2
E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4
K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0
-----END PRIVATE KEY-----
```

---

## Summary

### **What You Need:**

1. ✅ Services ID from Apple Developer portal
2. ✅ Team ID from Apple Developer portal (top right)
3. ✅ Key ID from .p8 filename
4. ✅ Private Key content from .p8 file

### **What You DON'T Need:**

- ❌ Generate JWT yourself
- ❌ Any additional configuration
- ❌ Code or scripts

### **Supabase Handles:**

- ✅ JWT generation
- ✅ Token signing
- ✅ Apple authentication
- ✅ User session creation

---

## Next Steps

1. **Copy your .p8 file content**
2. **Go to Supabase dashboard**
3. **Enable Apple provider**
4. **Fill in the 4 fields**
5. **Save**
6. **Test sign in!**

---

**Still stuck?** Tell me:
1. What error message do you see in Supabase?
2. Did you copy the entire private key including BEGIN/END lines?
3. Are you using the Services ID (not App ID)?

I'll help you troubleshoot!

