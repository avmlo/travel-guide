import { NextResponse } from 'next/server'
import { SignJWT, importPKCS8 } from 'jose'

export async function GET(request: Request) {
  try {
    const teamId = process.env.MAPKIT_TEAM_ID
    const keyId = process.env.MAPKIT_KEY_ID
    let privateKey = process.env.MAPKIT_PRIVATE_KEY

    if (!teamId || !keyId || !privateKey) {
      return new NextResponse('Missing MapKit env vars', { status: 500 })
    }

    // Support "escaped" newlines in env
    privateKey = privateKey.replace(/\\n/g, '\n')

    // Apple requires ES256
    const alg = 'ES256'
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 30 // 30 minutes

    const host = new URL(request.url).host
    const origin = `${request.headers.get('x-forwarded-proto') || 'https'}://${host}`

    const key = await importPKCS8(privateKey, alg)
    const token = await new SignJWT({
      origin: [origin],
      // scope: 'mapkitjs' // optional per docs
    })
      .setProtectedHeader({ alg, kid: keyId, typ: 'JWT' })
      .setIssuer(teamId)
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(key)

    return new NextResponse(token, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (e) {
    return new NextResponse('Failed to generate token', { status: 500 })
  }
}


