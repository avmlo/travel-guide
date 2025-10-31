import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[enrich-google] Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!)

async function findPlaceId(query: string): Promise<string | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
  url.searchParams.set('input', query)
  url.searchParams.set('inputtype', 'textquery')
  url.searchParams.set('fields', 'place_id')
  url.searchParams.set('key', GOOGLE_API_KEY!)
  const r = await fetch(url.toString())
  const j = await r.json()
  return j?.candidates?.[0]?.place_id || null
}

async function getPlaceDetails(placeId: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', [
    'formatted_address',
    'international_phone_number',
    'website',
    'price_level',
    'rating',
    'user_ratings_total',
    'opening_hours',
    'plus_code',
    'geometry',
    'review',
  ].join(','))
  url.searchParams.set('key', GOOGLE_API_KEY!)
  const r = await fetch(url.toString())
  const j = await r.json()
  return j?.result || null
}

async function getTimeZone(lat: number, lng: number) {
  const url = new URL('https://maps.googleapis.com/maps/api/timezone/json')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('timestamp', Math.floor(Date.now() / 1000).toString())
  url.searchParams.set('key', GOOGLE_API_KEY!)
  const r = await fetch(url.toString())
  const j = await r.json()
  return j?.timeZoneId || null
}

export async function POST(req: Request) {
  try {
    if (!GOOGLE_API_KEY) return NextResponse.json({ error: 'Missing GOOGLE_API_KEY' }, { status: 500 })

    const adminEmail = (req.headers.get('x-admin-email') || '').toLowerCase()
    const allowed = ADMIN_EMAILS.includes(adminEmail)
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(() => ({})) as { slug?: string, limit?: number, offset?: number }
    const { slug, limit = 10, offset = 0 } = body

    // Select targets
    let rows: any[] = []
    if (slug) {
      const { data, error } = await supabase.from('destinations').select('slug,name,city,google_place_id').eq('slug', slug).limit(1)
      if (error) {
        return NextResponse.json({ error: `Database error: ${error.message}`, slug }, { status: 500 })
      }
      rows = data || []
      if (rows.length === 0) {
        return NextResponse.json({ 
          error: `Destination not found`, 
          slug,
          message: 'No destination found with this slug. Check the slug in your database.' 
        }, { status: 404 })
      }
    } else {
      const { data, error } = await supabase
        .from('destinations')
        .select('slug,name,city,google_place_id')
        .or('google_place_id.is.null,formatted_address.is.null,international_phone_number.is.null,website.is.null')
        .order('slug', { ascending: true })
        .range(offset, Math.max(offset + limit - 1, offset))
      if (error) {
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
      }
      rows = data || []
    }

    const results: any[] = []
    for (const row of rows) {
      const query = `${row.name} ${row.city}`
      let placeId = row.google_place_id as string | null
      if (!placeId) placeId = await findPlaceId(query)
      if (!placeId) { results.push({ slug: row.slug, ok: false, reason: 'no_place_id' }); continue }

      const details = await getPlaceDetails(placeId)
      if (!details) { results.push({ slug: row.slug, ok: false, reason: 'no_details' }); continue }

      const lat = details.geometry?.location?.lat
      const lng = details.geometry?.location?.lng
      const timezone_id = (lat != null && lng != null) ? await getTimeZone(lat, lng) : null

      const reviews = Array.isArray(details.reviews) ? details.reviews.slice(0, 5).map((r: any) => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relative_time_description: r.relative_time_description,
        language: r.language,
      })) : []

      const update = {
        google_place_id: placeId,
        formatted_address: details.formatted_address || null,
        international_phone_number: details.international_phone_number || null,
        website: details.website || null,
        price_level: details.price_level ?? null,
        rating: details.rating ?? null,
        user_ratings_total: details.user_ratings_total ?? null,
        opening_hours_json: details.opening_hours ? JSON.stringify(details.opening_hours) : null,
        plus_code: details.plus_code?.global_code || null,
        latitude: lat ?? null,
        longitude: lng ?? null,
        timezone_id,
        reviews_json: reviews.length ? JSON.stringify(reviews) : null,
      }

      const { error: upErr } = await supabase.from('destinations').update(update as any).eq('slug', row.slug)
      results.push({ slug: row.slug, ok: !upErr, error: upErr?.message })
    }

    return NextResponse.json({ count: results.length, results, nextOffset: offset + results.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Use POST with JSON to run enrichment.',
    example: {
      headers: { 'Content-Type': 'application/json', 'x-admin-email': 'you@example.com' },
      body: { limit: 100, offset: 0 },
    },
  });
}


