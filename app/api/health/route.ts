import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    hasDatabase: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasGoogleMapsKey: Boolean(process.env.NEXT_PUBLIC_GOOGLE_API_KEY),
    hasGoogleAiKey: Boolean(process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY),
  };

  const healthy = Object.values(checks).every(Boolean);

  if (!healthy) {
    console.warn('Health check failed. Missing configuration detected.');
  }

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      message: healthy
        ? 'All critical environment variables are configured.'
        : 'Environment configuration is incomplete. See server logs for details.',
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
