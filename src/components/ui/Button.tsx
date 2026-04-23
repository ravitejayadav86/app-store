import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "glass";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-linear-to-br from-[var(--primary)] to-[var(--primary-dim)] text-on-primary shadow-lg shadow-primary/20",
      secondary: "liquid-glass text-primary hover:bg-white/60",
      tertiary: "bg-transparent text-primary hover:bg-primary/5",
      glass: "liquid-glass-pill text-on-surface",
    };

    const sizes = {
      xs: "px-3 py-1 text-[10px] font-black tracking-widest uppercase",
      sm: "px-4 py-1.5 text-xs font-bold",
      md: "px-6 py-2.5 text-sm font-bold",
      lg: "px-8 py-3.5 text-base font-bold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          "inline-flex items-center justify-center rounded-pill transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props as any}
      />
    );
  }
);

Button.displayName = "Button";
