import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function mask(value?: string | null) {
  if (!value) return null
  const v = value.toString()
  if (v.length <= 8) return `${'*'.repeat(Math.max(0, v.length - 2))}${v.slice(-2)}`
  return `${v.slice(0, 4)}${'*'.repeat(v.length - 8)}${v.slice(-4)}`
}

export async function GET() {
  const rawKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''

  const result: any = {
    keyPresent: !!rawKey,
    keySample: mask(rawKey),
    gemini: { ok: false as boolean, error: null as null | string },
    mapsPlaces: { ok: false as boolean, status: null as null | string, error_message: null as null | string },
    timestamp: new Date().toISOString(),
  }

  if (!rawKey) {
    return NextResponse.json(result, { status: 200 })
  }

  // Test Gemini (server-side) with a tiny prompt
  try {
    const genAI = new GoogleGenerativeAI(rawKey)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' })
    const resp = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] })
    const text = resp.response.text() || ''
    result.gemini.ok = text.length >= 0 // call succeeded even if empty
  } catch (e: any) {
    result.gemini.error = e?.message || 'unknown'
  }

  // Test Google Places Text Search (may fail if key is restricted to browser refs)
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Tokyo&key=${encodeURIComponent(rawKey)}`
    const r = await fetch(url)
    const j = await r.json().catch(() => ({}))
    result.mapsPlaces.ok = r.ok && (j.status === 'OK' || j.results !== undefined)
    result.mapsPlaces.status = j.status || (r.ok ? 'OK' : `HTTP_${r.status}`)
    result.mapsPlaces.error_message = j.error_message || null
  } catch (e: any) {
    result.mapsPlaces.ok = false
    result.mapsPlaces.status = 'ERROR'
    result.mapsPlaces.error_message = e?.message || 'unknown'
  }

  return NextResponse.json(result, { status: 200 })
}


