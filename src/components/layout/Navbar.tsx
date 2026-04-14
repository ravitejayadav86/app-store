"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <div className="glass w-full max-w-7xl rounded-pill flex items-center justify-between px-6 py-3 border border-outline-variant">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 overflow-hidden">
            <Image
              src="/panda-logo.png"
              alt="Panda Store Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-inter font-bold text-xl tracking-tight text-on-surface">PandaStore</span>
        </Link>

        {/* Categories - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {["Discover", "Categories", "Music", "Books", "Community", "Support"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors tracking-tight"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="tertiary" size="sm">
                <User size={18} className="mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/publisher">
              <Button size="sm">Publisher Portal</Button>
            </Link>
          </div>
          <button className="md:hidden p-2 text-on-surface-variant">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};
