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
          className="md:hidden fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur-xl z-50 border-t border-white/10"
        >
      <div className="grid grid-cols-6 items-center pt-1 pb-safe px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              className={`relative flex flex-col items-center gap-0.5 w-full py-1.5 transition-colors duration-300 ${
                isActive ? "text-primary" : "text-white/40 hover:text-white"
              }`}
            >
              <div className="relative group">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1 : 0.85,
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: isActive ? "#fff" : "inherit",
                  }}
                  className="px-4 py-1 rounded-full flex items-center justify-center transition-all"
                >
                  {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute inset-0 bg-white/5 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              
              <span className={`text-[9px] font-bold uppercase tracking-tight transition-transform duration-300 ${isActive ? "scale-105" : "scale-100 opacity-60"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      <style jsx global>{`
        .pb-safe {
          padding-bottom: calc(env(safe-area-inset-bottom, 8px) + 4px);
        }
      `}</style>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
