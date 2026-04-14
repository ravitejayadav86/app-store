import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PandaStore | Premium App Store",
  description: "Experience the next generation of application marketplaces with PandaStore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
        <Navbar />
        <main className="flex-grow pt-24">
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
