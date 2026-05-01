import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { UILayoutWrapper } from "@/components/layout/UILayoutWrapper";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MusicProvider } from "@/lib/MusicContext";

// ── Font: load with display=swap to avoid FOIT ───────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

// ── SEO & Social metadata ─────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://app-store-smoky.vercel.app"),
  title: {
    default: "PandaStore | Discover Apps, Games, Music & Books",
    template: "%s | PandaStore",
  },
  description:
    "PandaStore is an open app marketplace where creators publish apps, games, music tracks, and e-books for free. Discover, download, and rate content from independent developers worldwide.",
  keywords: [
    "app store", "panda store", "indie apps", "free apps", "games",
    "music", "books", "e-books", "developer marketplace", "publish apps",
    "download apps", "telugu music", "free music streaming",
  ],
  authors: [{ name: "PandaStore Team" }],
  creator: "PandaStore",
  applicationName: "PandaStore",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app-store-smoky.vercel.app",
    siteName: "PandaStore",
    title: "PandaStore | Discover Apps, Games, Music & Books",
    description: "Discover and publish apps, games, music, and books — all free on PandaStore.",
    images: [
      {
        url: "/panda-logo.png",
        width: 512,
        height: 512,
        alt: "PandaStore Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PandaStore | Discover Apps, Games, Music & Books",
    description: "Discover and publish apps, games, music, and books on PandaStore.",
    images: ["/panda-logo.png"],
    creator: "@pandastore",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // ── Apple / iOS ────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    title: "PandaStore",
    statusBarStyle: "black-translucent",
  },
  // ── Microsoft / Windows ────────────────────────────────────────────────
  other: {
    "msapplication-TileColor": "#0058bb",
    "msapplication-config": "/browserconfig.xml",
    "mobile-web-app-capable": "yes",
  },
};

// ── Viewport ─────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6fb" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // iOS notch / dynamic island support
  interactiveWidget: "resizes-content",
};

// ── Vercel region hint ────────────────────────────────────────────────────
export const preferredRegion = "bom1"; // Mumbai — closest to India users

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* ── Preconnect to critical origins ── */}
        <link rel="preconnect" href="https://pandas-store-api.onrender.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.jamendo.com" crossOrigin="anonymous" />

        {/* ── DNS prefetch for secondary origins ── */}
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://c.saavncdn.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* ── Apple touch icons ── */}
        <link rel="apple-touch-icon" sizes="180x180" href="/paw-logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/paw-logo.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/paw-logo.png" />

        {/* ── Apple splash screens (standalone mode) ── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PandaStore" />

        {/* ── Windows tile ── */}
        <meta name="msapplication-TileImage" content="/panda-logo.png" />
        <meta name="msapplication-TileColor" content="#0058bb" />

        {/* ── Format detection: don't linkify phone numbers ── */}
        <meta name="format-detection" content="telephone=no" />

        {/* ── Anti-FOUC theme script (inline, <1KB, blocks nothing else) ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('pandas_theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}
            if('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err){});
              });
            }`
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-surface overflow-x-hidden"
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider>
            <MusicProvider>
              <UILayoutWrapper>{children}</UILayoutWrapper>
              <Footer />
              <Toaster position="bottom-right" theme="system" richColors />
              <SpeedInsights />
            </MusicProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}