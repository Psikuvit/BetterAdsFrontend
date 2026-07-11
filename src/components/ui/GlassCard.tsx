"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glow?: "blue" | "purple" | "cyan" | "none";
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className = "",
  glow = "none",
  hover = true,
  delay = 0,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      className={cn(
        "rounded-xl border border-border bg-card p-6 backdrop-blur-sm",
        "transition-all duration-200",
        hover && "hover:border-border/80",
        glow === "blue" && "shadow-glow-blue",
        glow === "purple" && "shadow-glow-purple",
        glow === "cyan" && "shadow-glow-cyan",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
