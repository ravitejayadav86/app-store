"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("splash_shown");
    const isMobile = window.innerWidth < 768;

    if (hasShown || !isMobile) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash_shown", "true");
    }, 2000);

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Dynamic Liquid Swirl Background */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180, 270, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-[600px] h-[600px] bg-linear-to-r from-pink-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-[100px]"
          />

          <div className="relative flex flex-col items-center">
            {/* The Liquid Ring & Panda Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-64 h-64 md:w-80 md:h-80"
            >
              {/* Outer Liquid Glow */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, -360]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[2px] border-transparent bg-linear-to-r from-pink-500/50 via-cyan-400/50 to-blue-600/50 opacity-30 blur-xl"
              />

              {/* Main Panda Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/panda-intro.png"
                  alt="Waving Panda"
                  fill
                  className="object-contain z-10"
                  priority
                />
                
                {/* Waving Paw Overlay Effect (Subtle scale pulse on the whole panda to simulate life) */}
                <motion.div
                  animate={{ 
                    rotate: [0, -2, 2, -2, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 z-20 pointer-events-none"
                />
              </div>
            </motion.div>

            {/* Premium Text Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-center z-30"
            >
              <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                Panda<span className="bg-linear-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">Store</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                Premium Digital Oasis
              </p>
            </motion.div>
          </div>

          {/* Liquid Loading Bar */}
          <div className="absolute bottom-16 w-40 h-[1px] bg-white/10 overflow-hidden rounded-full">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full h-full bg-linear-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,0.5)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
