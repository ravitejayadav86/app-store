"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasShown = sessionStorage.getItem("splash_shown");
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash_shown", "true");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Ambient Glow Background */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.4, 0.2],
              scale: [0.8, 1.2, 1],
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
          />

          <div className="relative flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.7, rotate: -10 }}
              animate={{ 
                opacity: 1, 
                y: [0, -10, 0], 
                scale: 1,
                rotate: 0,
              }}
              transition={{ 
                opacity: { duration: 1, ease: [0.22, 1, 0.36, 1] },
                y: { 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                },
                scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                rotate: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                delay: 0.2
              }}
              className="relative w-32 h-32 md:w-40 md:h-40"
            >
              <div className="absolute inset-0 bg-white/5 rounded-[40px] blur-3xl" />
              <div className="relative w-full h-full">
                <Image
                  src="/panda-logo.png"
                  alt="PandaStore Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_50px_rgba(0,88,187,0.3)]"
                  priority
                />
                {/* Shimmer Overlay */}
                <motion.div
                  initial={{ x: "-150%", opacity: 0 }}
                  animate={{ x: "150%", opacity: [0, 0.5, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 1,
                    ease: "linear" 
                  }}
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </div>
            </motion.div>

            {/* Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              className="mt-8 text-center"
            >
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2">
                Panda<span className="text-primary">Store</span>
              </h1>
              <div className="flex items-center gap-2 justify-center">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="h-[1px] bg-white/20"
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Premium Experience
                </span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="h-[1px] bg-white/20"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom loading indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                className="w-full h-full bg-linear-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
