"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";

const LINKS_BY_ROLE: Record<string, { href: string; label: string }[]> = {
  ADVERTISER: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/campaigns", label: "Campaigns" },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/ads", label: "All Ads" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/review-queue", label: "Review Queue" },
  ],
  PUBLISHER: [],
};

export function Nav() {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  if (!user || !role) return null;

  const links = LINKS_BY_ROLE[role] || [];

  return (
    <header className="sticky top-0 z-50 glass border-b border-neutral-200 dark:border-white/5">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-blue">
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <span className="text-lg font-medium text-neutral-900 dark:text-white">
            Better<span className="text-gradient">Ads</span>
          </span>
        </div>

        <nav className="flex items-center gap-1 rounded-xl bg-neutral-100 dark:bg-white/5 p-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-all duration-200 hover:bg-neutral-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/80"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <span className="hidden text-sm text-neutral-400 dark:text-white/40 sm:inline">{user.email}</span>
          <Button variant="ghost" onClick={() => logout()} className="px-2 py-1">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
