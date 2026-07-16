"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Role } from "@/lib/types";

const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  ADVERTISER: "/dashboard",
  ADMIN: "/admin",
  PUBLISHER: "/sites",
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
    return <FullScreenLoader label="Loading..." />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <FullScreenLoader label="Redirecting..." />;
  }

  return <>{children}</>;
}
