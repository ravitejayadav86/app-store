import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-linear-to-br from-[var(--primary)] to-[var(--primary-dim)] text-on-primary shadow-sm hover:opacity-90",
      secondary: "bg-surface-low text-primary hover:bg-surface-lowest",
      tertiary: "bg-transparent text-primary hover:underline",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-xs font-medium",
      md: "px-6 py-2.5 text-sm font-semibold",
      lg: "px-8 py-3.5 text-base font-bold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-pill transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
