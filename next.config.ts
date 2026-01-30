import type { NextConfig } from "next";

const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb',
    },
  },
} satisfies NextConfig;

export default nextConfig;
