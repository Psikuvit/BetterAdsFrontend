"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role === "ADMIN") {
      router.replace("/admin");
    } else if (role === "PUBLISHER") {
      router.replace("/ads/lookup");
    } else {
      router.replace("/dashboard");
    }
  }, [loading, user, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Loading...
    </div>
  );
}
