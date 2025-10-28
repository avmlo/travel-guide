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

  // Handle OAuth redirect
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleOAuthCallback(token);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (token: string) => {
    // TODO: Implement OAuth callback once Stytch is configured
    setError('Stytch authentication is not fully configured yet.');
  };

  const handlePasskeySignIn = async () => {
    const stytch = getStytchClient();
    if (!stytch) {
      setError('Stytch is not configured. Please add NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to your environment variables.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Implement passkey authentication once Stytch SDK is properly initialized
      // stytch.webauthn.authenticate({ domain: window.location.hostname })
      setError('Passkey authentication will be available once Stytch is configured');
    } catch (err: any) {
      setError(err.message || 'Passkey authentication failed');
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
      const redirect = searchParams.get('redirect') || searchParams.get('returnTo') || '/';

      // TODO: Implement Apple OAuth once Stytch SDK is properly initialized
      // stytch.oauth.apple.start({
      //   login_redirect_url: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      //   signup_redirect_url: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      // });
      setError('Apple Sign In will be available once Stytch is configured');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple');
    }
  };

  const handleGoogleSignIn = async () => {
    const stytch = getStytchClient();
    if (!stytch) {
      setError('Stytch is not configured. Please add NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to your environment variables.');
      return;
    }

    // TODO: Implement Google OAuth once Stytch SDK is properly initialized
    setError('Stytch authentication pending full configuration');
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
          <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        {/* Apple Sign In */}
        <button
          onClick={handleAppleSignIn}
          disabled={loading}
          className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white rounded-lg hover:opacity-80 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span>Continue with Apple</span>
        </button>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

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
          Sign in with passkeys, Apple, or Google
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
