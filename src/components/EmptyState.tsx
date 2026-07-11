"use client";

import { Button } from "@/components/ui/Button";

type IllustrationType = "campaigns" | "ads" | "reviews" | "data" | "search" | "success";

const illustrations: Record<IllustrationType, React.ReactNode> = {
  campaigns: (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-neutral-100 dark:text-white/5" />
      <rect x="35" y="40" width="50" height="40" rx="4" fill="currentColor" className="text-neutral-200 dark:text-white/10" />
      <rect x="40" y="45" width="20" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/20" />
      <rect x="40" y="52" width="14" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
      <rect x="40" y="59" width="24" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
      <circle cx="80" cy="42" r="8" fill="currentColor" className="text-electric-blue/30" />
      <path d="M78 42L80 44L83 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-electric-blue" />
    </svg>
  ),
  ads: (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-neutral-100 dark:text-white/5" />
      <rect x="38" y="35" width="44" height="50" rx="4" fill="currentColor" className="text-neutral-200 dark:text-white/10" />
      <rect x="43" y="42" width="34" height="20" rx="3" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
      <polygon points="55,48 55,56 62,52" fill="currentColor" className="text-electric-blue/50" />
      <rect x="43" y="67" width="24" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
      <rect x="43" y="73" width="16" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
    </svg>
  ),
  reviews: (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-neutral-100 dark:text-white/5" />
      <circle cx="60" cy="55" r="20" fill="currentColor" className="text-neutral-200 dark:text-white/10" />
      <path d="M52 55L58 61L70 49" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
      <rect x="45" y="80" width="30" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
      <rect x="50" y="86" width="20" height="3" rx="1.5" fill="currentColor" className="text-neutral-300 dark:text-white/15" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-neutral-100 dark:text-white/5" />
      <rect x="35" y="70" width="10" height="20" rx="2" fill="currentColor" className="text-electric-blue/40" />
      <rect x="50" y="55" width="10" height="35" rx="2" fill="currentColor" className="text-vibrant-purple/40" />
      <rect x="65" y="45" width="10" height="45" rx="2" fill="currentColor" className="text-neon-cyan/40" />
      <rect x="80" y="60" width="10" height="30" rx="2" fill="currentColor" className="text-electric-blue/30" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-neutral-100 dark:text-white/5" />
      <circle cx="55" cy="52" r="18" stroke="currentColor" strokeWidth="3" className="text-neutral-300 dark:text-white/20" fill="none" />
      <line x1="68" y1="65" x2="82" y2="79" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-neutral-300 dark:text-white/20" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-success/10" />
      <circle cx="60" cy="60" r="30" fill="currentColor" className="text-success/15" />
      <path d="M48 60L56 68L74 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
    </svg>
  ),
};

interface EmptyStateProps {
  illustration: IllustrationType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-up">
      <div className="mb-4 animate-float">
        {illustrations[illustration]}
      </div>
      <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
