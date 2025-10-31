import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during builds to test Payload setup
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: (() => {
      const patterns: { protocol: 'https'; hostname: string }[] = []
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          const { hostname } = new URL(supabaseUrl)
          patterns.push({ protocol: 'https', hostname })
        }
      } catch {}
      return patterns
    })(),
  },
};

export default nextConfig;
