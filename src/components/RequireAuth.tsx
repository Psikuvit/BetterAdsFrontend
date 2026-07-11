"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";

const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  ADVERTISER: "/dashboard",
  ADMIN: "/admin",
  PUBLISHER: "/ads/lookup",
};

export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace(DEFAULT_ROUTE_BY_ROLE[role]);
    }
  }, [loading, user, role, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-electric-blue" />
        Loading...
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-electric-blue" />
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
