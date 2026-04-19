"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Grid, Music, Book, User } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { name: "Games", icon: <Gamepad2 size={24} />, href: "/games" },
  { name: "Apps", icon: <Grid size={24} />, href: "/discover" }, // Changed to /discover or /apps as per project structure
  { name: "Music", icon: <Music size={24} />, href: "/music" },
  { name: "Books", icon: <Book size={24} />, href: "/books" },
  { name: "You", icon: <User size={24} />, href: "/profile" },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface/80 backdrop-blur-2xl border-t border-outline-variant z-50">
      <div className="flex justify-around items-center pt-2 pb-safe px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 w-16 py-2 transition-colors duration-300 ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div className="relative group">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1 : 0.8,
                    backgroundColor: isActive ? "var(--primary-container)" : "transparent",
                    color: isActive ? "var(--on-primary)" : "inherit",
                  }}
                  className="px-5 py-1.5 rounded-full flex items-center justify-center transition-all"
                >
                  {item.icon}
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              
              <span className={`text-[10px] font-bold uppercase tracking-tight transition-transform duration-300 ${isActive ? "scale-110" : "scale-100 opacity-70"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      <style jsx global>{`
        .pb-safe {
          padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 8px);
        }
      `}</style>
    </nav>
  );
};
