"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
      router.replace("/campaigns");
    } else if (role === "PUBLISHER") {
      router.replace("/ads/lookup");
    } else {
      router.replace("/dashboard");
    }
  }, [loading, user, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
      Loading...
    </div>
  );
}
