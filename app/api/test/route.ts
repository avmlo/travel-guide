import { NextResponse } from 'next/server'

function mask(value?: string | null) {
  if (!value) return null
  const v = value.toString()
  if (v.length <= 8) return `${'*'.repeat(Math.max(0, v.length - 2))}${v.slice(-2)}`
  return `${v.slice(0, 4)}${'*'.repeat(v.length - 8)}${v.slice(-4)}`
}

export async function GET() {
  const google = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || null
  const mapkitTeam = process.env.MAPKIT_TEAM_ID || null
  const mapkitKeyId = process.env.MAPKIT_KEY_ID || null
  const mapkitPk = process.env.MAPKIT_PRIVATE_KEY || null

  return NextResponse.json({
    googleApiKey: {
      exists: !!google,
      sample: mask(google),
    },
    appleMapKit: {
      teamId: {
        exists: !!mapkitTeam,
        sample: mask(mapkitTeam),
      },
      keyId: {
        exists: !!mapkitKeyId,
        sample: mask(mapkitKeyId),
      },
      privateKey: {
        exists: !!mapkitPk,
        // do not echo contents
      },
    },
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
  })
}


