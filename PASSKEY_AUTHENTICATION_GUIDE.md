# Passkey Authentication for Urban Manual

**Great idea!** Passkeys are the future of authentication - more secure, easier to use, and password-free.

---

## Why Passkeys are Perfect for Urban Manual

### **User Benefits:**
- ✅ **No passwords to remember** - Sign in with Face ID, Touch ID, or Windows Hello
- ✅ **Faster login** - One tap/click to sign in
- ✅ **More secure** - Phishing-resistant, no password leaks
- ✅ **Works everywhere** - iOS, Android, Mac, Windows, Chrome, Safari

### **Your Benefits:**
- ✅ **No password reset emails** - Users can't forget their password
- ✅ **No password database** - Nothing to leak or hack
- ✅ **Better conversion** - Easier signup = more users
- ✅ **Modern & premium** - Matches Urban Manual's aesthetic

### **Perfect for Urban Manual Because:**
- Design-conscious users likely have modern devices (iPhone, MacBook)
- Premium brand = premium auth experience
- Travel app = users want quick access on mobile
- No complex forms = better UX

---

## Passkey Solutions Comparison

| Solution | Free Tier | Complexity | Supabase Integration | Best For |
|----------|-----------|------------|---------------------|----------|
| **Corbado** 🏆 | 10K MAU | Easy | ✅ Excellent | **Recommended** |
| **Descope** | 7.5K MAU | Easy | ✅ Good | Alternative |
| **Auth.js (NextAuth)** | Unlimited | Medium | ⚠️ Manual | DIY approach |
| **Clerk** | 10K MAU | Easy | ⚠️ Replace Supabase | Full auth solution |
| **Hanko** | 8K MAU | Easy | ⚠️ Manual | Open-source |

---

## Recommended Solution: Corbado + Supabase

### **Why Corbado:**
1. ✅ **Built specifically for Supabase** - Official integration
2. ✅ **10,000 MAU free** - More than enough to start
3. ✅ **Easy setup** - 30 minutes
4. ✅ **Keep your Supabase database** - No migration needed
5. ✅ **Passkey-first** - Designed for modern auth

### **How It Works:**
```
User visits Urban Manual
    ↓
Clicks "Sign in with passkey"
    ↓
Face ID / Touch ID prompt
    ↓
Corbado authenticates
    ↓
Creates Supabase session
    ↓
User is signed in!
```

---

## Implementation Guide: Corbado + Supabase

### **Part 1: Setup Corbado (15 minutes)**

#### **Step 1: Create Corbado Account**

```
1. Go to: https://app.corbado.com/signup
2. Sign up (free)
3. Create new project: "Urban Manual"
```

#### **Step 2: Get Credentials**

```
1. Go to: Settings → Credentials
2. Copy:
   - Project ID
   - API Secret
   - Frontend API
```

#### **Step 3: Configure Corbado**

```
1. Go to: Settings → General
2. Application URL: https://theurbanmanual.com
3. Redirect URL: https://theurbanmanual.com/auth/callback
4. Save
```

#### **Step 4: Enable Passkeys**

```
1. Go to: Authentication Methods
2. Enable: Passkeys
3. Optional: Also enable Email OTP as fallback
4. Save
```

### **Part 2: Connect to Supabase (10 minutes)**

#### **Step 1: Install Corbado SDK**

```bash
cd urban-manual-next
npm install @corbado/react @corbado/node-sdk
```

#### **Step 2: Add Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_CORBADO_PROJECT_ID=pro_xxx
CORBADO_API_SECRET=corbado_api_secret_xxx
NEXT_PUBLIC_CORBADO_FRONTEND_API=https://xxx.frontendapi.corbado.io
```

#### **Step 3: Create Corbado Provider**

```typescript
// app/providers.tsx
'use client';

import { CorbadoProvider } from '@corbado/react';
import { createClient } from '@/lib/supabase/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CorbadoProvider
      projectId={process.env.NEXT_PUBLIC_CORBADO_PROJECT_ID!}
      frontendAPI={process.env.NEXT_PUBLIC_CORBADO_FRONTEND_API!}
      onSessionChange={async (session) => {
        if (session) {
          // Create Supabase session when Corbado session is created
          const supabase = createClient();
          await supabase.auth.setSession({
            access_token: session.token,
            refresh_token: session.refreshToken,
          });
        }
      }}
    >
      {children}
    </CorbadoProvider>
  );
}
```

#### **Step 4: Wrap Your App**

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### **Part 3: Add Sign-In UI (5 minutes)**

#### **Option 1: Pre-built Component (Easiest)**

```typescript
// components/PasskeySignIn.tsx
'use client';

import { CorbadoAuth } from '@corbado/react';

export function PasskeySignIn() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sign in to Urban Manual</h2>
      <CorbadoAuth
        onLoggedIn={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}
```

#### **Option 2: Custom UI (More Control)**

```typescript
// components/PasskeySignIn.tsx
'use client';

import { useCorbado } from '@corbado/react';
import { useState } from 'react';

export function PasskeySignIn() {
  const { login, isLoading } = useCorbado();
  const [email, setEmail] = useState('');

  const handleSignIn = async () => {
    try {
      await login(email);
      // User will see Face ID / Touch ID prompt
      // On success, redirects to home
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Sign in with Passkey</h2>
      
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 rounded hover:opacity-80"
      >
        {isLoading ? 'Signing in...' : 'Continue with Passkey'}
      </button>
      
      <p className="text-sm text-gray-600 text-center">
        You'll use Face ID, Touch ID, or Windows Hello
      </p>
    </div>
  );
}
```

### **Part 4: Protect Routes**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CorbadoAuth } from '@corbado/node-sdk';

const corbado = new CorbadoAuth(process.env.CORBADO_API_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('corbado_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    await corbado.sessions.validateToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/saved', '/profile', '/settings'],
};
```

---

## Alternative: Pure Supabase + Auth.js Passkeys

If you want to stick with Supabase only (no third-party):

### **Setup (More Complex)**

```bash
npm install next-auth@beta @simplewebauthn/server @simplewebauthn/browser
```

### **Configure Auth.js**

```typescript
// auth.ts
import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import Passkey from 'next-auth/providers/passkey';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Passkey({
      rpName: 'Urban Manual',
      rpID: 'theurbanmanual.com',
    }),
  ],
});
```

**Pros:**
- ✅ No third-party service
- ✅ Free (unlimited)
- ✅ Full control

**Cons:**
- ❌ More complex setup
- ❌ Need to handle edge cases yourself
- ❌ More maintenance

---

## User Experience Flow

### **First-Time User:**

```
1. Visit Urban Manual
2. Click "Sign in"
3. Enter email
4. Prompted: "Create passkey for faster sign-in?"
5. Face ID / Touch ID prompt
6. ✅ Passkey created
7. Signed in!
```

### **Returning User:**

```
1. Visit Urban Manual
2. Click "Sign in"
3. Face ID / Touch ID prompt (automatic!)
4. ✅ Signed in!
```

**That's it!** No password, no email verification, no friction.

---

## Design Mockup

### **Sign-In Page:**

```
┌─────────────────────────────────────────┐
│                                         │
│         URBAN MANUAL                    │
│                                         │
│    ┌─────────────────────────────────┐ │
│    │                                 │ │
│    │  Sign in with Passkey          │ │
│    │                                 │ │
│    │  [your@email.com            ]  │ │
│    │                                 │ │
│    │  ┌───────────────────────────┐ │ │
│    │  │   Continue with Passkey   │ │ │
│    │  └───────────────────────────┘ │ │
│    │                                 │ │
│    │  🔐 You'll use Face ID or      │ │
│    │     Touch ID to sign in        │ │
│    │                                 │ │
│    └─────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### **Passkey Prompt (iOS):**

```
┌─────────────────────────────────────────┐
│                                         │
│         Urban Manual                    │
│                                         │
│    Sign in with Face ID                 │
│                                         │
│         👤                              │
│        ( )                              │
│                                         │
│    [Cancel]              [Continue]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Cost Comparison

### **Corbado:**
- **Free:** 10,000 MAU (Monthly Active Users)
- **Pro:** $25/month for 25,000 MAU
- **Enterprise:** Custom pricing

### **Descope:**
- **Free:** 7,500 MAU
- **Essentials:** $99/month for 25,000 MAU

### **Clerk:**
- **Free:** 10,000 MAU
- **Pro:** $25/month for 25,000 MAU
- **Note:** Replaces Supabase Auth entirely

### **Auth.js (Self-hosted):**
- **Free:** Unlimited
- **Cost:** Your time to implement and maintain

---

## Browser Support

### **Passkeys work on:**
- ✅ **iOS 16+** - Face ID / Touch ID
- ✅ **macOS Ventura+** - Touch ID
- ✅ **Android 9+** - Fingerprint / Face Unlock
- ✅ **Windows 10+** - Windows Hello
- ✅ **Chrome 108+**
- ✅ **Safari 16+**
- ✅ **Edge 108+**

**Coverage:** ~95% of your users!

---

## Migration Strategy

### **Phase 1: Add Passkeys (Week 1)**
- Keep existing auth (email/password)
- Add passkey option
- Encourage users to create passkeys

### **Phase 2: Make Passkeys Primary (Week 2-4)**
- Show passkey sign-in first
- Email/password as fallback
- Track adoption rate

### **Phase 3: Passkey-Only (Optional, Month 2+)**
- Once 80%+ users have passkeys
- Remove password option
- Cleaner, simpler auth

---

## Implementation Checklist

### **Setup:**
- [ ] Create Corbado account
- [ ] Install Corbado SDK
- [ ] Add environment variables
- [ ] Configure Corbado provider

### **UI:**
- [ ] Create sign-in page
- [ ] Add passkey button
- [ ] Style to match Urban Manual aesthetic
- [ ] Add loading states

### **Integration:**
- [ ] Connect to Supabase
- [ ] Sync user sessions
- [ ] Protect routes
- [ ] Test on multiple devices

### **Testing:**
- [ ] Test on iPhone (Face ID)
- [ ] Test on Mac (Touch ID)
- [ ] Test on Android
- [ ] Test on Windows
- [ ] Test fallback (no passkey support)

### **Launch:**
- [ ] Deploy to production
- [ ] Monitor adoption
- [ ] Collect user feedback
- [ ] Iterate

---

## Example: Complete Sign-In Page

```typescript
// app/sign-in/page.tsx
'use client';

import { CorbadoAuth } from '@corbado/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif">URBAN MANUAL</h1>
          <p className="text-gray-600 mt-2">Sign in to save destinations</p>
        </div>

        {/* Corbado Auth Component */}
        <CorbadoAuth
          onLoggedIn={() => {
            router.push('/');
          }}
        />

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>🔐 Secure sign-in with Face ID or Touch ID</p>
          <p className="mt-2">No password required</p>
        </div>
      </div>
    </div>
  );
}
```

---

## Summary

### **Why Passkeys for Urban Manual:**
- ✅ **Premium experience** - Matches your brand
- ✅ **Better conversion** - Easier signup
- ✅ **More secure** - No passwords to leak
- ✅ **Future-proof** - Industry standard
- ✅ **Mobile-first** - Perfect for travel app

### **Recommended Approach:**
1. **Use Corbado + Supabase** (easiest, best integration)
2. **10,000 free MAU** (plenty to start)
3. **30 minutes to implement**
4. **Keep your existing Supabase database**

### **Timeline:**
- **Day 1:** Setup Corbado, install SDK
- **Day 2:** Build sign-in UI
- **Day 3:** Test on devices
- **Day 4:** Deploy to production
- **Week 2:** Monitor adoption

---

## Next Steps

Would you like me to:
1. **Implement Corbado passkeys** - Set it up now?
2. **Create custom UI** - Design the sign-in page?
3. **Compare other solutions** - Descope, Clerk, etc.?
4. **Show Auth.js approach** - DIY passkeys?

**My recommendation:** Let's implement Corbado! It's the fastest way to get passkeys working with your existing Supabase setup.

What do you think?

