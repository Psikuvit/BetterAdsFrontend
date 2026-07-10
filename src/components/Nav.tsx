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
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold tracking-tight">BetterAds</span>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">{user.email}</span>
          <Button variant="ghost" onClick={() => logout()} className="px-2 py-1">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
