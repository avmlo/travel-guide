import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    // Try to initialize Payload
    const payload = await getPayload({ config })

    // Try to count destinations
    const result = await payload.count({
      collection: 'destinations',
    })

    return NextResponse.json({
      status: 'success',
      message: 'Payload CMS is working correctly',
      destinations_count: result.totalDocs,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    }, { status: 500 })
  }
}
