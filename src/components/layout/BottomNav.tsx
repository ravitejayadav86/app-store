"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Grid, Music, Book, User, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Games", icon: <Gamepad2 size={24} />, href: "/games" },
  { name: "Apps", icon: <Grid size={24} />, href: "/discover" },
  { name: "Hub", icon: <Users size={24} />, href: "/community" },
  { name: "Books", icon: <Book size={24} />, href: "/books" },
  { name: "You", icon: <User size={24} />, href: "/profile" },
  { name: "Settings", icon: <Settings size={24} />, href: "/settings" },
];

export const BottomNav = ({ isHidden = false }: { isHidden?: boolean }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="md:hidden fixed bottom-0 inset-x-0 liquid-glass z-50 border-t border-white/30 !rounded-none"
        >
      <div className="grid grid-cols-6 items-center pt-1 pb-safe px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              className={`relative flex flex-col items-center gap-0.5 w-full py-1 transition-colors duration-300 ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div className="relative group">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1 : 0.85,
                    backgroundColor: isActive ? "var(--primary-container)" : "transparent",
                    color: isActive ? "var(--on-primary)" : "inherit",
                  }}
                  className="px-4 py-1 rounded-full flex items-center justify-center transition-all"
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
              
              <span className={`text-[9px] font-bold uppercase tracking-tighter transition-transform duration-300 ${isActive ? "scale-105" : "scale-100 opacity-60"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      <style jsx global>{`
        .pb-safe {
          padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 4px);
        }
      `}</style>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
