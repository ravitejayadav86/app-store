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
  const [uiHiddenOverride, setUiHiddenOverride] = useState<boolean | null>(null);
  const pathname = usePathname();

  const isDetailPage = pathname?.startsWith("/apps/") || 
                       pathname?.startsWith("/game/") || 
                       pathname?.startsWith("/users/") ||
                       pathname?.startsWith("/profile");
                       
  // Reset override on navigation
  useEffect(() => {
    setUiHiddenOverride(null);
  }, [pathname]);

  const effectiveHidden = uiHiddenOverride !== null ? uiHiddenOverride : isDetailPage;

  useEffect(() => {
    let lastTapTime = 0;
    
    // Support both mouse double-click and touch double-tap
    const handleDoubleTap = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") || 
        target.closest("a") ||
        target.closest(".interactive")
      ) {
        return;
      }
      
      // Prevent selection on double click
      if (e.type === "dblclick") {
        window.getSelection()?.removeAllRanges();
      }

      setUiHiddenOverride(prev => {
        const currentlyHidden = prev !== null ? prev : isDetailPage;
        return !currentlyHidden;
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      if (tapLength < 300 && tapLength > 0) {
        handleDoubleTap(e);
        e.preventDefault();
      }
      lastTapTime = currentTime;
    };

    window.addEventListener("dblclick", handleDoubleTap);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      window.removeEventListener("dblclick", handleDoubleTap);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isDetailPage]);

  return (
    <>
      <Navbar isHidden={effectiveHidden} />
      <main className={`flex-grow transition-all duration-300 overflow-x-hidden ${effectiveHidden ? "pt-0 pb-0" : "pt-24 pb-24 md:pb-0"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.25, 
              ease: "easeOut"
            }}
            className="w-full h-full transform-gpu will-change-transform"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav isHidden={effectiveHidden} />
    </>
  );
};
