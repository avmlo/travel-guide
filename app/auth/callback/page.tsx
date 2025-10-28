'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStytchClient } from '@/lib/stytch';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      const stytch = getStytchClient();
      if (!stytch) {
        setError('Stytch authentication is not configured yet. Please check your environment variables.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      try {
        // Get OAuth token from URL
        const token = searchParams.get('token');

        if (!token) {
          setError('No authentication token found in URL');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
          return;
        }

        // Authenticate with OAuth token
        await stytch.oauth.authenticate(token, {
          session_duration_minutes: 43200, // 30 days
        });

        // Get redirect URL and navigate
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      } catch (err: any) {
        console.error('OAuth authentication error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    authenticate();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <div className="text-sm text-gray-500">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
        <div className="text-gray-600 dark:text-gray-400">Signing you in...</div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
