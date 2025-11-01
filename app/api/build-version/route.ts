import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Get build version from environment or package.json
export async function GET() {
  // Try Vercel's build environment variables first
  const vercelCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const vercelEnv = process.env.VERCEL_ENV;
  
  // Read package.json version
  let packageVersion = '0.1.0';
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    packageVersion = packageJson.version || '0.1.0';
  } catch (error) {
    console.error('Error reading package.json:', error);
  }
  
  // Use NEXT_PUBLIC_BUILD_VERSION if set, otherwise construct from available info
  const buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION 
    || (vercelCommitSha 
      ? `${packageVersion}-${vercelCommitSha.substring(0, 7)}${vercelEnv && vercelEnv !== 'production' ? ` (${vercelEnv})` : ''}`
      : `${packageVersion}-dev`);

  return NextResponse.json({ 
    version: buildVersion,
    packageVersion,
    commitSha: vercelCommitSha || null,
    environment: vercelEnv || null
  });
}

