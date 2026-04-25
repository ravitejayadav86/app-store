import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: (process.env.IS_CAPACITOR === 'true' && !process.env.VERCEL) ? 'export' : undefined,
  images: {
    unoptimized: (process.env.IS_CAPACITOR === 'true' && !process.env.VERCEL),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
