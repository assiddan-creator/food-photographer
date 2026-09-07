import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Result images use plain <img> tags (Fal CDN). next/image remotePatterns
  // are not required for the live generate → result → download path.
};

export default nextConfig;
