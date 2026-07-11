"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
  PUBLISHER: [{ href: "/ads/lookup", label: "Ad Variants" }],
};

export function Nav() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  if (!user || !role) return null;

  const links = LINKS_BY_ROLE[role] || [];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
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
          <span className="text-lg font-medium text-white">
            Better<span className="text-gradient">Ads</span>
          </span>
        </div>

        <nav className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="hidden text-sm text-white/40 sm:inline">{user.email}</span>
          <Button variant="ghost" onClick={() => logout()} className="px-2 py-1">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
