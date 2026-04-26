"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Grid, Music, Book, User, Users, Settings, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/hooks/useRealtime";
import api from "@/lib/api";

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
  const [mounted, setMounted] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    // Fetch userId and initial unread count silently
    api.get("/users/me").then(res => setUserId(res.data.id)).catch(() => {});
    api.get("/social/conversations").then(res => {
      const total = res.data.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
      setUnreadMessages(total);
    }).catch(() => {});
  }, []);

  const { useEvent } = useRealtime(userId || undefined);

  // Increment badge on new message, reset when on messages page
  useEvent("NEW_MESSAGE", (msg) => {
    if (!pathname?.startsWith("/messages")) {
      setUnreadMessages(prev => prev + 1);
    }
  });

  // Clear badge when user navigates to messages
  React.useEffect(() => {
    if (pathname?.startsWith("/messages")) {
      setUnreadMessages(0);
    }
  }, [pathname]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="md:hidden fixed bottom-0 inset-x-0 liquid-glass z-50 border-t border-white/30 !rounded-none transform-gpu will-change-transform"
        >
      <div className="flex justify-around items-center pt-2 pb-safe px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              className={`relative flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 ${
                isActive ? "text-primary" : "text-on-surface-variant/70 hover:text-on-surface"
              }`}
            >
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  className={`p-2 rounded-2xl flex items-center justify-center transition-all transform-gpu ${
                    isActive ? "bg-primary/10" : ""
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement<any>, { 
                    size: 22, 
                    strokeWidth: isActive ? 2.5 : 2 
                  })}
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Unread message badge on Hub (community/messages) */}
                {item.href === "/community" && unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-bold tracking-tight transition-all ${
                isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-0.5"
              }`}>
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

