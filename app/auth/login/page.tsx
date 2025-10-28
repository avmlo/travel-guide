'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getStytchClient } from '@/lib/stytch';
import { ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already logged in
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect') || searchParams.get('returnTo') || '/';
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  const handlePasskeySignIn = async () => {
    const stytch = getStytchClient();
    if (!stytch) {
      setError('Stytch is not configured. Please add NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to your environment variables.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Authenticate with passkey
      await stytch.webauthn.authenticate({
        domain: window.location.hostname,
        session_duration_minutes: 43200, // 30 days
      });

      // Redirect after successful authentication
      const redirect = searchParams.get('redirect') || searchParams.get('returnTo') || '/';
      router.push(redirect);
    } catch (err: any) {
      console.error('Passkey authentication error:', err);
      if (err.message?.includes('not supported')) {
        setError('Passkeys are not supported on this device or browser. Please try Apple Sign In instead.');
      } else if (err.message?.includes('not found')) {
        setError('No passkey found for this device. You may need to register a passkey first or try Apple Sign In.');
      } else {
        setError(err.message || 'Passkey authentication failed. Please try again or use Apple Sign In.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    const stytch = getStytchClient();
    if (!stytch) {
      setError('Stytch is not configured. Please add NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to your environment variables.');
      return;
    }

    try {
      // Store intended redirect destination in localStorage
      const redirect = searchParams.get('redirect') || searchParams.get('returnTo') || '/';
      localStorage.setItem('auth_redirect', redirect);

      // Use fixed callback URL without query parameters
      const callbackUrl = `${window.location.origin}/auth/callback`;

      // Start Apple OAuth flow - this will redirect the browser
      stytch.oauth.apple.start({
        login_redirect_url: callbackUrl,
        signup_redirect_url: callbackUrl,
      });
    } catch (err: any) {
      console.error('Apple Sign In error:', err);
      setError(err.message || 'Failed to sign in with Apple. Please try again.');
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-md mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:opacity-60 mb-8 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Sign In
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to The Urban Manual
        </p>
      </div>

      {/* Passkey Sign In - Primary Method */}
      <button
        onClick={handlePasskeySignIn}
        disabled={loading}
        className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white rounded-lg hover:opacity-80 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.65 10C11.7 7.31 8.9 5.5 5.77 6.12c-2.29.46-4.15 2.29-4.63 4.58C.32 14.57 3.26 18 7 18c2.61 0 4.83-1.67 5.65-4H17v2c0 1.1.9 2 2 2s2-.9 2-2v-2c1.1 0 2-.9 2-2s-.9-2-2-2h-8.35zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
        <span>Sign in with Passkey</span>
      </button>

      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">Or</span>
        </div>
      </div>

      {/* Apple Sign In */}
      <button
        onClick={handleAppleSignIn}
        disabled={loading}
        className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white rounded-lg hover:opacity-80 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        <span>Continue with Apple</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          Secure passwordless authentication powered by Stytch
        </p>
        <p className="mt-2">
          Sign in with passkeys or Apple
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="px-6 md:px-10 py-8 max-w-md mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
