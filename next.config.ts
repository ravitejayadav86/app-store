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
      // App icon CDNs
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '*.wikimedia.org' },
      { protocol: 'https', hostname: 'play-lh.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.photopea.com' },
      { protocol: 'https', hostname: 'excalidraw.com' },
      { protocol: 'https', hostname: 'assets.vercel.com' },
      { protocol: 'https', hostname: 'images.chesscomfiles.com' },
      { protocol: 'https', hostname: 'monkeytype.com' },
      { protocol: 'https', hostname: 'littlealchemy2.com' },
      { protocol: 'https', hostname: 'www.geoguessr.com' },
      { protocol: 'https', hostname: 'snapdrop.net' },
      { protocol: 'https', hostname: 'tinywow.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      // Additional icon CDNs (v2 fix)
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'cpwebassets.codepen.io' },
      { protocol: 'https', hostname: 'c.staticblitz.com' },
      { protocol: 'https', hostname: 'vocalremover.org' },
      { protocol: 'https', hostname: 'shellshock.io' },
      { protocol: 'https', hostname: 'smashkarts.io' },
      { protocol: 'https', hostname: 'skribbl.io' },
      { protocol: 'https', hostname: 'krunker.io' },
      { protocol: 'https', hostname: 'fast.com' },
      { protocol: 'https', hostname: '12ft.io' },
      { protocol: 'https', hostname: 'squoosh.app' },
      { protocol: 'https', hostname: 'hextris.io' },
      { protocol: 'https', hostname: 'slither.io' },
      { protocol: 'https', hostname: 'agar.io' },
      { protocol: 'https', hostname: 'orteil.dashnet.org' },
    ],
  },

  // ── Compiler ───────────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Compression ────────────────────────────────────────────────────────
  compress: true,

  // ── HTTP caching & Security headers ────────────────────────────────────
  async headers() {
    return [
      {
        // Security headers for all routes
        source: '/:path*',
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
      {
        // Explicitly prevent caching on API routes
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
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
