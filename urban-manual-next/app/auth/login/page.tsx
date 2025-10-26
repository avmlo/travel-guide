'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

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

      {/* Login Form Placeholder */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Sign In
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Coming Soon
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-8">
          Authentication will be available in a future update. You can browse all destinations without signing in.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity font-medium"
        >
          Browse Destinations
        </button>
      </div>
    </div>
  );
}
