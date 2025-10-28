import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: false,
  turbopack: {},
};

export default withPayload(nextConfig);
