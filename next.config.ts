import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iupyonfezyujccbqtndt.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
