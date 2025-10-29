import { getSessionTokenFromCookies, getStytchClient } from '@/lib/stytch'
import Link from 'next/link'

async function getSession() {
  try {
    const token = await getSessionTokenFromCookies()
    if (!token) return null
    const stytch = getStytchClient()
    const { session } = await stytch.sessions.authenticate({ session_token: token })
    return session
  } catch {
    return null
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const session = await getSession()
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
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const email = (form.elements.namedItem('email') as HTMLInputElement).value
              const btn = form.querySelector('button') as HTMLButtonElement
              btn.disabled = true
              try {
                await fetch('/api/auth/start', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                })
                alert('Check your email for a magic link!')
              } catch {
                alert('Failed to send magic link')
              } finally {
                btn.disabled = false
              }
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className="w-full rounded border px-3 py-2"
            />
            <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">Send magic link</button>
          </form>
        )}
      </div>
    </main>
  )
}


