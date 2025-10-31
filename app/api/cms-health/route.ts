import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasPostgres = Boolean(process.env.POSTGRES_URL)
    const hasPayloadSecret = Boolean(process.env.PAYLOAD_SECRET)
    const isPayloadSecretStrong = (process.env.PAYLOAD_SECRET?.length || 0) >= 32

    const healthy = hasPostgres && hasPayloadSecret && isPayloadSecretStrong

    return NextResponse.json(
      {
        status: healthy ? 'healthy' : 'unhealthy',
        message: healthy
          ? 'Environment configuration looks healthy.'
          : 'Environment configuration is incomplete. Review server logs for details.',
      },
      {
        status: healthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed. See server logs for details.',
      },
      { status: 500 },
    )
  }
}
