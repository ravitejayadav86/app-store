import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, animate = true }) => {
  return (
    <motion.div
      whileHover={animate ? { y: -5, boxShadow: "0 30px 50px -5px rgba(45, 46, 51, 0.06)" } : {}}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 transition-all duration-300",
        "bg-surface-lowest border border-outline-variant",
        "hover:border-primary/20",
        className
      )}
    >
      {/* Subtle Tonal Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
