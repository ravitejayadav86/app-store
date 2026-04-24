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
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, animate = true, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={animate ? { y: -2, scale: 1.01 } : {}}
      whileTap={animate && onClick ? { scale: 0.98 } : {}}
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500",
        "card-glass transform-gpu will-change-transform",
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
