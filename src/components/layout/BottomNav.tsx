"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Grid, Music, Book, User, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/hooks/useRealtime";
import api from "@/lib/api";

// 120 Hz spring — settles in ~220 ms, zero overshoot
const SPRING_NAV  = { type: "spring", stiffness: 520, damping: 38, mass: 0.55 } as const;
const SPRING_PILL = { type: "spring", stiffness: 700, damping: 42, mass: 0.4  } as const;
const SPRING_ICON = { type: "spring", stiffness: 600, damping: 36, mass: 0.45 } as const;

const NAV_ITEMS = [
  { name: "Games",    icon: <Gamepad2 size={22} />, href: "/games"     },
  { name: "Apps",     icon: <Grid     size={22} />, href: "/discover"  },
  { name: "Hub",      icon: <Users    size={22} />, href: "/community" },
  { name: "Books",    icon: <Book     size={22} />, href: "/books"     },
  { name: "You",      icon: <User     size={22} />, href: "/profile"   },
  { name: "Settings", icon: <Settings size={22} />, href: "/settings"  },
];

export const BottomNav = ({ isHidden = false }: { isHidden?: boolean }) => {
  const pathname = usePathname();
  const [mounted,        setMounted]        = React.useState(false);
  const [userId,         setUserId]         = React.useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    api.get("/users/me").then(r => setUserId(r.data.id)).catch(() => {});
    api.get("/social/conversations").then(r => {
      const total = r.data.reduce((s: number, c: any) => s + (c.unread_count || 0), 0);
      setUnreadMessages(total);
    }).catch(() => {});
  }, []);

  const { useEvent } = useRealtime(userId || undefined);

  useEvent("NEW_MESSAGE", () => {
    if (!pathname?.startsWith("/messages")) setUnreadMessages(p => p + 1);
  });

  React.useEffect(() => {
    if (pathname?.startsWith("/messages")) setUnreadMessages(0);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.nav
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y: 90,  opacity: 0 }}
          transition={SPRING_NAV}
          style={{ willChange: "transform, opacity" }}
          className="md:hidden fixed bottom-0 inset-x-0 z-50 transform-gpu"
        >
          {/* ── Liquid glass panel ── */}
          <div className="bottom-nav-glass">
            <div className="flex justify-around items-center pt-2 pb-safe px-1 max-w-lg mx-auto">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-label={item.name}
                    className="relative flex flex-col items-center gap-0.5 flex-1 py-1 select-none"
                  >
                    {/* Active pill background — shared layoutId for smooth movement */}
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-bg"
                        className="absolute inset-x-1 top-0.5 bottom-4 rounded-2xl bg-primary/12"
                        transition={SPRING_PILL}
                        style={{ willChange: "transform" }}
                      />
                    )}

                    {/* Icon wrapper */}
                    <motion.div
                      animate={{
                        scale:      isActive ? 1.12 : 1,
                        y:          isActive ? -1   : 0,
                      }}
                      transition={SPRING_ICON}
                      style={{ willChange: "transform" }}
                      className={`relative z-10 p-2 rounded-xl flex items-center justify-center ${
                        isActive ? "text-primary" : "text-on-surface-variant/65"
                      }`}
                    >
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 2.5 : 1.9,
                      })}

                      {/* Unread badge */}
                      {item.href === "/community" && unreadMessages > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </motion.div>

                    {/* Label */}
                    <motion.span
                      animate={{
                        opacity: isActive ? 1    : 0.42,
                        y:       isActive ? 0    : 1,
                      }}
                      transition={SPRING_ICON}
                      style={{ willChange: "transform, opacity" }}
                      className={`text-[9px] font-bold tracking-tight relative z-10 ${
                        isActive ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {item.name}
                    </motion.span>

                    {/* Active dot indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          key="dot"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{   scale: 0, opacity: 0 }}
                          transition={SPRING_PILL}
                          className="absolute bottom-0 w-1 h-1 rounded-full bg-primary"
                          style={{ willChange: "transform, opacity" }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>

          <style jsx global>{`
            .pb-safe {
              padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);
            }
          `}</style>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
