"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";
import { Spinner } from "@/components/ui/Spinner";

const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  ADVERTISER: "/dashboard",
  ADMIN: "/campaigns",
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
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading...
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
