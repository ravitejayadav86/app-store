"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  
  // Hide footer on messenger pages
  if (pathname?.startsWith("/messages")) {
    return null;
  }

  return (
    <footer className="bg-transparent pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto liquid-glass p-12 md:p-24 border-white/30 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                <Image
                  src="/paw-logo.png"
                  alt="Panda Store Logo"
                  fill
                  className="object-cover filter drop-shadow-lg"
                />
              </div>
              <span className="font-black text-2xl tracking-tighter text-on-surface">PandaStore</span>
            </div>
            <p className="text-base text-on-surface-variant leading-relaxed font-bold opacity-80 max-w-[240px]">
              The premium destination for the world's most beautiful and functional digital experiences.
            </p>
          </div>

          {/* Links */}
          <div>
            <h2 className="font-black text-xs mb-8 uppercase tracking-[0.3em] text-primary">Explore</h2>
            <ul className="space-y-5">
              {["New Releases", "Top Charts", "Editors Choice", "Collections"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-on-surface-variant font-black hover:text-primary transition-all hover:translate-x-1 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-black text-xs mb-8 uppercase tracking-[0.3em] text-primary">Platform</h2>
            <ul className="space-y-5">
              {["iOS & macOS", "Android", "Web Player", "Dashboard"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-on-surface-variant font-black hover:text-primary transition-all hover:translate-x-1 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-black text-xs mb-8 uppercase tracking-[0.3em] text-primary">Community</h2>
            <ul className="space-y-5">
              {["For Developers", "Blog", "Support", "Careers"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-on-surface-variant font-black hover:text-primary transition-all hover:translate-x-1 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-24 pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[11px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
            © 2026 PandaStore App Store. Built with <span className="text-primary opacity-100">Liquid Glass</span> Design System.
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
