import { NextResponse } from 'next/server';
import packageJson from '@/../package.json';

// Get build version from environment or package.json
export async function GET() {
  // Try Vercel's build environment variables first
  const vercelCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const vercelEnv = process.env.VERCEL_ENV;
  
  // Use NEXT_PUBLIC_BUILD_VERSION if set, otherwise construct from available info
  const buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION 
    || (vercelCommitSha 
      ? `${packageJson.version}-${vercelCommitSha.substring(0, 7)}${vercelEnv !== 'production' ? ` (${vercelEnv})` : ''}`
      : `${packageJson.version}-dev`);

  return NextResponse.json({ 
    version: buildVersion,
    packageVersion: packageJson.version,
    commitSha: vercelCommitSha || null,
    environment: vercelEnv || null
  });
}

