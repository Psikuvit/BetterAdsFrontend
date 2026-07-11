"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "blue" | "purple" | "cyan" | "none";
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = "none",
  delay = 0,
}: GlassCardProps) {
  const glowClass =
    glow === "blue"
      ? "shadow-glow-blue"
      : glow === "purple"
        ? "shadow-glow-purple"
        : glow === "cyan"
          ? "shadow-glow-cyan"
          : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "glass rounded-2xl",
        hover && "transition-all duration-200 ease-smooth hover:glass-hover",
        glowClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
