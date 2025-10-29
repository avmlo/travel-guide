import { getCurrentSession } from '@/lib/session'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const session = await getCurrentSession()
  const error = params?.error

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6">{session ? 'You are signed in' : 'Sign in'}</h1>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">Authentication failed. Try again.</div>
        )}
        {session ? (
          <form action="/api/auth/logout" method="post">
            <button className="w-full rounded bg-black px-4 py-2 text-white">Sign out</button>
            <div className="mt-4 text-center text-sm">
              <Link href="/">Go home</Link>
            </div>
          </form>
        ) : (
          <form className="space-y-4" action="/api/auth/start" method="post">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className="w-full rounded border px-3 py-2"
            />
            <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">Send magic link</button>
            {params?.sent && (
              <div className="text-sm text-gray-600">If that email exists, we sent a magic link.</div>
            )}
          </form>
        )}
      </div>
    </main>
  )
}


