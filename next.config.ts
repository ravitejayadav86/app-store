import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: (process.env.IS_CAPACITOR === 'true' && !process.env.VERCEL) ? 'export' : undefined,

  // ── Image optimization ─────────────────────────────────────────────────
  images: {
    unoptimized: (process.env.IS_CAPACITOR === 'true' && !process.env.VERCEL),
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [360, 414, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'api.jamendo.com' },
      { protocol: 'https', hostname: 'c.saavncdn.com' },
      { protocol: 'https', hostname: '*.saavncdn.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // ── Compiler ───────────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Compression ────────────────────────────────────────────────────────
  compress: true,

  // ── HTTP caching headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        // Cache static assets aggressively (hashed filenames)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Cache public assets (fonts, images, icons)
        source: '/:path((?!api).*)\\.(:ext(png|jpg|jpeg|webp|avif|svg|woff2|woff|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Don't cache API routes
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        // HTML pages — revalidate quickly, serve stale while fetching
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },

  // ── Experimental ──────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'lodash',
      '@radix-ui/react-dialog',
    ],
    // Partial pre-rendering — static shell, dynamic data streamed in
    ppr: false,
  },

  // ── Turbopack for dev (faster HMR) ────────────────────────────────────
  // (enabled automatically via `next dev --turbopack` in package.json)
};

export default nextConfig;
