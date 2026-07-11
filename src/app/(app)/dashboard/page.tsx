"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import GlassCard from "@/components/ui-custom/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessage } from "@/lib/errors";
import * as analyticsApi from "@/lib/api/analytics";
import { AdvertiserAnalytics } from "@/lib/types";

function StatCard({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <GlassCard className="p-5" delay={delay}>
      <p className="text-white/40 text-sm">{label}</p>
      <div className="mt-2">
        <p className="font-mono text-2xl text-white">{value}</p>
      </div>
    </GlassCard>
  );
}

function DashboardContent() {
  const [data, setData] = useState<AdvertiserAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .getAdvertiserAnalytics()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-skeleton rounded-lg" />
          <div className="h-10 w-32 animate-skeleton rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <GlassCard className="p-5">
          <div className="h-4 w-32 animate-skeleton rounded mb-3" />
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-skeleton rounded-full" />
            <div className="h-6 w-16 animate-skeleton rounded-full" />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-error">{error}</p>;
  }

  if (!data) return null;

  const currency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-medium text-white">Dashboard</h1>
          <p className="mt-2 text-white/50">
            Welcome back. Here&apos;s your advertising overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="text-sm text-electric-blue transition-colors hover:text-neon-cyan"
          >
            View campaigns →
          </Link>
          <Link href="/campaigns?new=1">
            <Button>New campaign</Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Campaigns" value={String(data.campaignCount)} delay={0} />
        <StatCard label="Total spent" value={currency(data.totalSpent)} delay={0.06} />
        <StatCard label="Total budget" value={currency(data.totalBudget)} delay={0.12} />
        <StatCard label="Total views" value={data.totalViews.toLocaleString()} delay={0.18} />
      </div>

      {/* Campaigns by Status */}
      <GlassCard className="p-6" delay={0.24}>
        <p className="mb-3 text-sm font-medium text-white/70">
          Campaigns by status
        </p>
        {Object.keys(data.campaignsByStatus).length === 0 ? (
          <EmptyState
            illustration="campaigns"
            title="No campaigns yet"
            description="Create your first campaign to start advertising."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.campaignsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge status={status} />
                <span className="text-sm text-white/40">{count}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER"]}>
      <DashboardContent />
    </RequireAuth>
  );
}
