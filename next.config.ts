import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: (process.env.IS_CAPACITOR === 'true' && !process.env.VERCEL) ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
