"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessage } from "@/lib/errors";
import * as analyticsApi from "@/lib/api/analytics";
import { AdvertiserAnalytics } from "@/lib/types";

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
        <div className="glass rounded-2xl p-5">
          <div className="h-4 w-32 animate-skeleton rounded mb-3" />
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-skeleton rounded-full" />
            <div className="h-6 w-16 animate-skeleton rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) return null;

  const currency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/campaigns"
            className="text-sm text-electric-blue transition-colors hover:text-neon-cyan"
          >
            View campaigns →
          </Link>
          <Link href="/campaigns?new=1">
            <Button>
              <Plus className="h-3.5 w-3.5" />
              New campaign
            </Button>
          </Link>
        </div>
      </div>

      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Campaigns" value={String(data.campaignCount)} />
        <StatCard label="Total spent" value={currency(data.totalSpent)} />
        <StatCard label="Total budget" value={currency(data.totalBudget)} />
        <StatCard label="Total views" value={data.totalViews.toLocaleString()} />
      </div>

      <Card>
        <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
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
