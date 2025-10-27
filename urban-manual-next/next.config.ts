import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during builds to test Payload setup
    ignoreDuringBuilds: true,
  },
};

export default withPayload(nextConfig);
