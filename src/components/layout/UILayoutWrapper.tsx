"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UILayoutWrapperProps {
  children: React.ReactNode;
}

const AUTO_HIDE_DELAY = 4000;

// 120 Hz springs
const SPRING_PAGE = { type: "spring", stiffness: 380, damping: 34, mass: 0.5 } as const;
const SPRING_HINT = { type: "spring", stiffness: 450, damping: 30, mass: 0.5 } as const;

export const UILayoutWrapper = ({ children }: UILayoutWrapperProps) => {
  const pathname = usePathname();
  const [panelsVisible, setPanelsVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setPanelsVisible(false);
      setShowHint(true);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      hintTimerRef.current = setTimeout(() => setShowHint(false), 3000);
    }, AUTO_HIDE_DELAY);
  }, []);

  // Reset on navigation
  useEffect(() => {
    const isMusicDetail = pathname?.startsWith("/music/") && pathname !== "/music";
    if (isMusicDetail) {
      setPanelsVisible(false);
      setShowHint(false);
    } else {
      setPanelsVisible(true);
      scheduleHide();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [pathname, scheduleHide]);

  // Activity keeps panels alive
  useEffect(() => {
    const isMusicDetail = pathname?.startsWith("/music/") && pathname !== "/music";
    if (isMusicDetail) return;

    const onActivity = () => { if (panelsVisible) scheduleHide(); };
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("scroll",    onActivity, { passive: true });
    window.addEventListener("keydown",   onActivity, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("scroll",    onActivity);
      window.removeEventListener("keydown",   onActivity);
    };
  }, [panelsVisible, scheduleHide, pathname]);

  // Double-click / double-tap toggle
  useEffect(() => {
    let lastTap = 0;

    const toggle = (e: Event) => {
      const t = e.target as HTMLElement;
      if (
        t.tagName === "BUTTON" || t.tagName === "A" ||
        t.tagName === "INPUT"  || t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.closest("button") || t.closest("a") ||
        t.closest("input")  || t.closest("textarea") ||
        t.closest(".interactive")
      ) return;

      if (e.type === "dblclick") window.getSelection()?.removeAllRanges();

      setPanelsVisible(prev => {
        const next = !prev;
        if (next) {
          setShowHint(false);
          scheduleHide();
        }
        return next;
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300 && now - lastTap > 0) { toggle(e); e.preventDefault(); }
      lastTap = now;
    };

    window.addEventListener("dblclick",    toggle);
    window.addEventListener("touchstart",  onTouchStart, { passive: false });
    return () => {
      window.removeEventListener("dblclick",   toggle);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [scheduleHide]);

  return (
    <>
      <Navbar isHidden={!panelsVisible} />

      <main className={`flex-grow overflow-x-hidden ${
        panelsVisible ? "pt-24 pb-24 md:pb-0" : "pt-0 pb-0"
      }`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0         }}
            transition={SPRING_PAGE}
            style={{ willChange: "transform, opacity" }}
            className="w-full h-full transform-gpu"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav isHidden={!panelsVisible} />

      {/* Hint pill */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 12,  scale: 0.92 }}
            transition={SPRING_HINT}
            style={{ willChange: "transform, opacity" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="hint-pill">
              <span className="text-white/85 text-[11px] font-semibold tracking-wide select-none">
                Double-tap to show navigation
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
