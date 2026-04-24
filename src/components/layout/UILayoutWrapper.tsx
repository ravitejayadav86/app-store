"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UILayoutWrapperProps {
  children: React.ReactNode;
}

export const UILayoutWrapper = ({ children }: UILayoutWrapperProps) => {
  const [uiHidden, setUiHidden] = useState(false);
  const pathname = usePathname();

  const isDetailPage = pathname?.startsWith("/apps/") || 
                       pathname?.startsWith("/game/") || 
                       pathname?.startsWith("/users/") ||
                       pathname?.startsWith("/profile");
  const effectiveHidden = uiHidden || isDetailPage;

  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.closest(".interactive")
      ) {
        return;
      }
      
      setUiHidden(prev => !prev);
    };

    window.addEventListener("dblclick", handleDoubleClick);
    return () => window.removeEventListener("dblclick", handleDoubleClick);
  }, []);

  return (
    <>
      <Navbar isHidden={effectiveHidden} />
      <main className={`flex-grow transition-all duration-500 overflow-x-hidden ${effectiveHidden ? "pt-0 pb-0" : "pt-24 pb-24 md:pb-0"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav isHidden={effectiveHidden} />
    </>
  );
};
