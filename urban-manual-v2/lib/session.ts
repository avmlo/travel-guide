import { getSessionTokenFromCookies, getStytchClient } from '@/lib/stytch'

export type AuthSession = {
  userId: string
  expiresAt: string
  attributes?: Record<string, unknown>
} | null

export async function getCurrentSession(): Promise<AuthSession> {
  try {
    const token = await getSessionTokenFromCookies()
    if (!token) return null
    const stytch = getStytchClient()
    const { session } = await stytch.sessions.authenticate({ session_token: token })
    return {
      userId: session.user_id,
      expiresAt: session.expires_at,
      attributes: session.authentication_factors?.[0]?.attributes as Record<string, unknown> | undefined,
    }
  } catch {
    return null
  }
}


