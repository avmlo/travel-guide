import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.builder.io', 'localhost'],
  },
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)

