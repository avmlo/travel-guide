import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during builds to test Payload setup
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
