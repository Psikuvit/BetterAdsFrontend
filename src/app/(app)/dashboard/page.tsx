"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { errorMessage } from "@/lib/errors";
import * as analyticsApi from "@/lib/api/analytics";
import { AdvertiserAnalytics } from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
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
    return <p className="text-sm text-neutral-500">Loading dashboard...</p>;
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
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link
          href="/campaigns"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          View campaigns →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          <p className="text-sm text-neutral-500">No campaigns yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.campaignsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge status={status} />
                <span className="text-sm text-neutral-500">{count}</span>
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
