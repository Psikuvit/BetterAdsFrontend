"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  Link2,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";

const LINKS_BY_ROLE: Record<string, { href: string; label: string; icon: LucideIcon }[]> = {
  ADVERTISER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: FolderKanban },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/ads", label: "All Ads", icon: ShieldCheck },
    { href: "/campaigns", label: "Campaigns", icon: FolderKanban },
    { href: "/review-queue", label: "Review Queue", icon: ListChecks },
  ],
  PUBLISHER: [{ href: "/ads/lookup", label: "Ad Variants", icon: Link2 }],
};

export function Nav() {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-neutral-100 dark:bg-white/5 p-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/70"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
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
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <span className="hidden text-sm text-neutral-400 dark:text-white/40 lg:inline">{user.email}</span>
          <Button variant="ghost" onClick={() => logout()} className="hidden md:inline-flex px-2 py-1">
            Sign out
          </Button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-all duration-200 hover:bg-neutral-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/80 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-neutral-200 dark:border-white/5 px-6 py-3 animate-fade-up">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-neutral-100 text-neutral-900 dark:bg-white/10 dark:text-white"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/70"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-neutral-200 dark:border-white/5 pt-3">
              <span className="truncate text-sm text-neutral-400 dark:text-white/40">{user.email}</span>
              <Button variant="ghost" onClick={() => logout()} className="px-2 py-1">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
