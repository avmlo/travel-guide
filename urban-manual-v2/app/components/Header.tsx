import Link from 'next/link'
import { getCurrentSession } from '@/lib/session'

export default async function Header() {
  const session = await getCurrentSession()
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-gray-900">Urban Manual</h1>
            <p className="mt-2 text-sm text-gray-600">A curated guide to the world's most exceptional places</p>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/studio"
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
                >
                  Studio
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="border px-3 py-2 rounded text-sm">Sign out</button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


