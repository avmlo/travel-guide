# Apple Sign In Setup Guide for Supabase

**Date:** October 27, 2025
**Goal:** Set up Apple Sign In for Urban Manual with Supabase authentication

---

## Why Apple Sign In?

### **Benefits:**
- ✅ **Required for iOS apps** - Apple mandates it if you offer other social logins
- ✅ **Privacy-focused** - Users can hide their email
- ✅ **Native experience** - Seamless on iOS devices
- ✅ **High conversion** - Users trust Apple authentication
- ✅ **One-tap login** - Face ID/Touch ID integration

### **Use Cases:**
- iOS app authentication
- Web app with iOS users
- Privacy-conscious users
- Streamlined onboarding

---

## Prerequisites

Before you start, you need:
- ✅ **Apple Developer Account** ($99/year)
- ✅ **Supabase project** (you have this)
- ✅ **Domain name** (for web, e.g., urbanmanual.com)
- ✅ **30-45 minutes** for setup

---

## Part 1: Apple Developer Setup

### **Step 1: Create an App ID** (10 minutes)

1. **Go to Apple Developer Portal:**
   - Visit: https://developer.apple.com/account
   - Sign in with your Apple ID

2. **Navigate to Certificates, Identifiers & Profiles:**
   - Click "Certificates, Identifiers & Profiles" in sidebar
   - Click "Identifiers"
   - Click the **"+"** button

3. **Register an App ID:**
   ```
   Select: App IDs
   Click: Continue
   
   Type: App
   Click: Continue
   
   Description: Urban Manual
   Bundle ID: Explicit
   Bundle ID value: com.urbanmanual.app
   
   Scroll down to Capabilities:
   ✅ Check "Sign in with Apple"
   
   Click: Continue
   Click: Register
   ```

4. **Configure Sign in with Apple:**
   ```
   Click on your newly created App ID
   Find "Sign in with Apple" capability
   Click: Configure
   
   Primary App ID: (select the one you just created)
   Click: Save
   ```

---

### **Step 2: Create a Services ID** (10 minutes)

This is the OAuth client that Supabase will use.

1. **Create Services ID:**
   ```
   Go back to Identifiers
   Click: "+" button
   
   Select: Services IDs
   Click: Continue
   
   Description: Urban Manual Web Auth
   Identifier: com.urbanmanual.auth
   (Must be different from App ID)
   
   ✅ Check "Sign in with Apple"
   Click: Continue
   Click: Register
   ```

2. **Configure Services ID:**
   ```
   Click on your Services ID
   Check "Sign in with Apple"
   Click: Configure
   
   Primary App ID: com.urbanmanual.app
   
   Website URLs:
   Domains and Subdomains: urbanmanual.com
   (Or your Vercel domain: urbanmanual.vercel.app)
   
   Return URLs: 
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   
   Example:
   https://avdnefdfwvpjkuanhdwk.supabase.co/auth/v1/callback
   
   Click: Next
   Click: Done
   Click: Continue
   Click: Save
   ```

**Important:** The Return URL format is:
```
https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
```

Find your project ref in Supabase:
- Go to: https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk/settings/api
- It's in the URL: `avdnefdfwvpjkuanhdwk`

---

### **Step 3: Create a Private Key** (5 minutes)

1. **Generate Key:**
   ```
   Go to: Keys (in left sidebar)
   Click: "+" button
   
   Key Name: Urban Manual Sign In Key
   ✅ Check "Sign in with Apple"
   
   Click: Configure
   Select your Primary App ID: com.urbanmanual.app
   Click: Save
   
   Click: Continue
   Click: Register
   ```

2. **Download the Key:**
   ```
   ⚠️ IMPORTANT: You can only download this ONCE!
   
   Click: Download
   Save file: AuthKey_XXXXXXXXXX.p8
   
   Note down:
   - Key ID: XXXXXXXXXX (10 characters)
   - Team ID: YYYYYYYYYY (found in top right of portal)
   ```

3. **Store Safely:**
   ```bash
   # Save the .p8 file securely
   # You'll need the contents for Supabase
   
   # To view contents:
   cat AuthKey_XXXXXXXXXX.p8
   
   # Copy the entire content including:
   # -----BEGIN PRIVATE KEY-----
   # ... key content ...
   # -----END PRIVATE KEY-----
   ```

---

## Part 2: Supabase Configuration

### **Step 4: Configure Supabase** (10 minutes)

1. **Go to Supabase Dashboard:**
   ```
   Visit: https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk
   Click: Authentication (left sidebar)
   Click: Providers
   Find: Apple
   Click: Enable
   ```

2. **Enter Apple Credentials:**
   ```
   Services ID: com.urbanmanual.auth
   (The Services ID you created, NOT the App ID)
   
   Team ID: YYYYYYYYYY
   (Found in Apple Developer portal, top right)
   
   Key ID: XXXXXXXXXX
   (From the downloaded .p8 file name)
   
   Private Key:
   (Paste the ENTIRE contents of AuthKey_XXXXXXXXXX.p8)
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   -----END PRIVATE KEY-----
   
   Click: Save
   ```

3. **Verify Configuration:**
   ```
   You should see:
   ✅ Apple - Enabled
   
   Callback URL (for reference):
   https://avdnefdfwvpjkuanhdwk.supabase.co/auth/v1/callback
   ```

---

## Part 3: Implementation

### **Step 5: Web Implementation** (Next.js)

#### **5.1 Install Supabase Auth UI (Optional)**

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

#### **5.2 Create Sign In Component**

```typescript
// components/AppleSignIn.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function AppleSignIn() {
  const supabase = createClient()

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={['apple']}
      onlyThirdPartyProviders
    />
  )
}
```

#### **5.3 Or Custom Button**

```typescript
// components/AppleSignInButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function AppleSignInButton() {
  const supabase = createClient()

  const handleAppleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'name email', // Request name and email
      },
    })

    if (error) {
      console.error('Error signing in with Apple:', error)
    }
  }

  return (
    <button
      onClick={handleAppleSignIn}
      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      Continue with Apple
    </button>
  )
}
```

#### **5.4 Create Auth Callback Route**

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home or dashboard
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

#### **5.5 Use in Login Page**

```typescript
// app/login/page.tsx
import AppleSignInButton from '@/components/AppleSignInButton'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to Urban Manual</h2>
          <p className="mt-2 text-gray-600">
            Discover curated destinations worldwide
          </p>
        </div>

        <div className="space-y-4">
          <AppleSignInButton />
          
          {/* Other sign-in options */}
        </div>
      </div>
    </div>
  )
}
```

---

### **Step 6: iOS Implementation** (Swift)

#### **6.1 Install Supabase Swift SDK**

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
]
```

#### **6.2 Configure Supabase Client**

```swift
// SupabaseManager.swift
import Supabase
import AuthenticationServices

class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()
    
    let client: SupabaseClient
    
    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: "https://avdnefdfwvpjkuanhdwk.supabase.co")!,
            supabaseKey: "your-anon-key"
        )
    }
}
```

#### **6.3 Create Apple Sign In View**

```swift
// AppleSignInButton.swift
import SwiftUI
import AuthenticationServices
import Supabase

struct AppleSignInButton: View {
    @EnvironmentObject var supabase: SupabaseManager
    @State private var isLoading = false
    
    var body: some View {
        SignInWithAppleButton(
            onRequest: { request in
                request.requestedScopes = [.fullName, .email]
            },
            onCompletion: { result in
                handleSignIn(result: result)
            }
        )
        .signInWithAppleButtonStyle(.black)
        .frame(height: 50)
        .cornerRadius(8)
    }
    
    private func handleSignIn(result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
                return
            }
            
            Task {
                do {
                    // Get ID token
                    guard let identityToken = credential.identityToken,
                          let tokenString = String(data: identityToken, encoding: .utf8) else {
                        return
                    }
                    
                    // Sign in with Supabase
                    try await supabase.client.auth.signInWithIdToken(
                        credentials: .init(
                            provider: .apple,
                            idToken: tokenString
                        )
                    )
                    
                    // Success! User is now signed in
                } catch {
                    print("Error signing in: \(error)")
                }
            }
            
        case .failure(let error):
            print("Apple Sign In failed: \(error)")
        }
    }
}
```

#### **6.4 Use in Login View**

```swift
// LoginView.swift
import SwiftUI

struct LoginView: View {
    var body: some View {
        VStack(spacing: 24) {
            // Logo
            Text("UM")
                .font(.system(size: 60, weight: .light, design: .serif))
            
            Text("URBAN MANUAL")
                .font(.caption)
                .tracking(4)
            
            Spacer()
            
            // Apple Sign In
            AppleSignInButton()
                .padding(.horizontal)
            
            // Other sign-in options
        }
        .padding()
    }
}
```

---

## Part 4: Testing

### **Step 7: Test the Integration** (5 minutes)

#### **Web Testing:**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Login Page:**
   ```
   http://localhost:3000/login
   ```

3. **Click "Continue with Apple":**
   - Should redirect to Apple's sign-in page
   - Sign in with your Apple ID
   - Should redirect back to your app
   - Check Supabase dashboard → Authentication → Users

#### **iOS Testing:**

1. **Run in Simulator:**
   ```bash
   # Xcode: Product → Run (Cmd+R)
   ```

2. **Test Sign In:**
   - Tap "Sign in with Apple"
   - Use test Apple ID
   - Verify user appears in Supabase

---

## Part 5: Production Checklist

### **Before Going Live:**

- [ ] **Apple Developer Account** is active ($99/year paid)
- [ ] **Services ID** configured with production domain
- [ ] **Return URL** updated in Apple Developer portal
- [ ] **Private key** stored securely (never commit to git)
- [ ] **Supabase** Apple provider enabled and configured
- [ ] **Environment variables** set in production
- [ ] **Callback route** deployed and working
- [ ] **Privacy policy** mentions Apple Sign In
- [ ] **Terms of service** updated
- [ ] **Tested** on real iOS device
- [ ] **Tested** on web browser

---

## Troubleshooting

### **Common Issues:**

#### **1. "invalid_client" Error**
```
Problem: Services ID or credentials incorrect
Solution:
- Double-check Services ID in Supabase
- Verify Team ID and Key ID
- Ensure private key is complete (including BEGIN/END lines)
```

#### **2. "redirect_uri_mismatch" Error**
```
Problem: Return URL doesn't match Apple configuration
Solution:
- Check Return URL in Apple Developer portal
- Format: https://<project-ref>.supabase.co/auth/v1/callback
- Must match exactly (no trailing slash)
```

#### **3. "User Cancelled" Error**
```
Problem: User closed Apple Sign In popup
Solution: This is normal, just let user try again
```

#### **4. Email Not Provided**
```
Problem: User chose "Hide My Email"
Solution:
- Apple provides a relay email: privaterelay.appleid.com
- Store this in your database
- You can still send emails through Apple's relay
```

#### **5. iOS App Not Working**
```
Problem: App ID not configured correctly
Solution:
- Verify Bundle ID matches exactly
- Check "Sign in with Apple" capability is enabled
- Ensure Xcode project has capability enabled
```

---

## Security Best Practices

### **Protect Your Keys:**

```bash
# Never commit private keys to git
echo "AuthKey_*.p8" >> .gitignore

# Store in environment variables
APPLE_KEY_ID=XXXXXXXXXX
APPLE_TEAM_ID=YYYYYYYYYY
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### **Validate Tokens:**

```typescript
// Always validate on server-side
export async function validateAppleToken(idToken: string) {
  // Supabase handles this automatically
  // But you can add additional checks if needed
}
```

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| **Apple Developer Account** | $99 | Annual |
| **Supabase** | $0 | Free tier |
| **Domain** | $10-15 | Annual |
| **Total** | ~$110 | Per year |

---

## Summary

### **What You Need:**

1. ✅ **Apple Developer Account** ($99/year)
2. ✅ **App ID** with Sign in with Apple enabled
3. ✅ **Services ID** for OAuth
4. ✅ **Private Key** (.p8 file)
5. ✅ **Supabase** configured with Apple provider

### **Implementation:**

- **Web:** `signInWithOAuth({ provider: 'apple' })`
- **iOS:** `SignInWithAppleButton` + Supabase SDK

### **Time Required:**

- **Setup:** 30-45 minutes
- **Implementation:** 30-60 minutes
- **Testing:** 15-30 minutes
- **Total:** 1.5-2.5 hours

---

## Next Steps

Would you like me to:
1. **Walk you through the Apple Developer setup** step-by-step?
2. **Create the sign-in components** for your Urban Manual app?
3. **Set up the iOS implementation** for your native app?
4. **Test the integration** together?

Apple Sign In is essential for iOS apps and provides a great user experience. Let me know which part you'd like help with first!

