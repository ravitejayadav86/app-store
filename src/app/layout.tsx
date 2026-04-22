import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Copilot } from "@/components/Copilot";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app-store-smoky.vercel.app"),
  title: {
    default: "PandaStore | Discover Apps, Games, Music & Books",
    template: "%s | PandaStore",
  },
  description:
    "PandaStore is an open app marketplace where creators publish apps, games, music tracks, and e-books for free. Discover, download, and rate content from independent developers worldwide.",
  keywords: [
    "app store", "panda store", "indie apps", "free apps", "games", "music", "books", "e-books",
    "developer marketplace", "publish apps", "download apps"
  ],
  authors: [{ name: "PandaStore Team" }],
  creator: "PandaStore",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app-store-smoky.vercel.app",
    siteName: "PandaStore",
    title: "PandaStore | Discover Apps, Games, Music & Books",
    description:
      "Discover and publish apps, games, music, and books — all free on PandaStore.",
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
};

export const viewport: Viewport = {
  themeColor: "#6750A4",
};

export const preferredRegion = "bom1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-24 pb-24 md:pb-0 font-inter">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <Copilot />
          <Toaster position="bottom-right" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}