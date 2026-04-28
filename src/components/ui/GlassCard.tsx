import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, useMotionValue, useTransform } from "framer-motion";

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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 40%)`
  );

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={animate ? { y: -4, scale: 1.005, transition: { duration: 0.2, ease: "easeOut" as const } } : {}}
      whileTap={animate && onClick ? { scale: 0.985 } : {}}
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300",
        "liquid-glass transform-gpu will-change-transform",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Dynamic Reveal Highlight */}
      {animate && (
        <motion.div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background }}
        />
      )}
      
      {/* Subtle Tonal Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
