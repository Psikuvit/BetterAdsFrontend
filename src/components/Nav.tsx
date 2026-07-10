"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Eye,
  LogOut,
} from "lucide-react";

const LINKS_BY_ROLE: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  ADVERTISER: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { href: "/campaigns", label: "Campaigns", icon: <Megaphone className="size-4" /> },
  ],
  ADMIN: [
    { href: "/campaigns", label: "Campaigns", icon: <Megaphone className="size-4" /> },
    { href: "/review-queue", label: "Review Queue", icon: <ShieldCheck className="size-4" /> },
  ],
  PUBLISHER: [
    { href: "/ads/lookup", label: "Ad Variants", icon: <Eye className="size-4" /> },
  ],
};

export function Nav() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  if (!user || !role) return null;

  const links = LINKS_BY_ROLE[role] || [];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <span className="text-base font-semibold tracking-tight text-foreground">
            Better<span className="text-primary">Ads</span>
          </span>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-muted-foreground">{user.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-muted-foreground"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <nav className="sm:hidden flex items-center justify-around border-t border-border px-2 py-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
