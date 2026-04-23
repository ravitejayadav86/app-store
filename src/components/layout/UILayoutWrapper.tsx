"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { usePathname } from "next/navigation";

interface UILayoutWrapperProps {
  children: React.ReactNode;
}

export const UILayoutWrapper = ({ children }: UILayoutWrapperProps) => {
  const [uiHidden, setUiHidden] = useState(false);
  const pathname = usePathname();

  // Automatically hide UI on mobile for detail and profile pages
  const isDetailPage = pathname?.startsWith("/apps/") || 
                       pathname?.startsWith("/game/") || 
                       pathname?.startsWith("/users/") ||
                       pathname?.startsWith("/profile");
  const effectiveHidden = uiHidden || isDetailPage;

  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      // Don't toggle if clicking on interactive elements
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
      <main className={`flex-grow transition-all duration-500 ${effectiveHidden ? "pt-0 pb-0" : "pt-24 pb-24 md:pb-0"}`}>
        {children}
      </main>
      <BottomNav isHidden={effectiveHidden} />
    </>
  );
};
