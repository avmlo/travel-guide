import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as { email?: string }
    const email = (body.email || '').toLowerCase().trim()
    if (!email) return NextResponse.json({ isAdmin: false })

    const listRaw = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').toString()
    const allowed = listRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    return NextResponse.json({ isAdmin: allowed.includes(email) })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}


