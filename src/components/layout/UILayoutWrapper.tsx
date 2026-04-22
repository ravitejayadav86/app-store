"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

interface UILayoutWrapperProps {
  children: React.ReactNode;
}

export const UILayoutWrapper = ({ children }: UILayoutWrapperProps) => {
  const [uiHidden, setUiHidden] = useState(false);

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
      <Navbar isHidden={uiHidden} />
      <main className={`flex-grow pt-24 pb-24 md:pb-0 transition-all duration-500 ${uiHidden ? "pt-0 pb-0" : "pt-24 pb-24"}`}>
        {children}
      </main>
      <BottomNav isHidden={uiHidden} />
    </>
  );
};
