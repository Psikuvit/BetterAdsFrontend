"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Ad, Campaign } from "@/lib/types";

interface AdminStats {
  totalCampaigns: number;
  campaignsByStatus: Record<string, number>;
  totalAds: number;
  adsByStatus: Record<string, number>;
  totalBudget: number;
  totalSpent: number;
  flaggedAds: number;
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-2 font-mono text-2xl text-neutral-900 dark:text-white">{value}</p>
    </>
  );
  return (
    <Card>
      {href ? <Link href={href} className="block hover:underline">{inner}</Link> : inner}
    </Card>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let page = 0;
      const allCampaigns: Campaign[] = [];
      while (true) {
        const res = await campaignsApi.listCampaigns({ page, size: 50 });
        allCampaigns.push(...res.content);
        if (res.last) break;
        page++;
      }

      const campaignsByStatus: Record<string, number> = {};
      let totalBudget = 0;
      let totalSpent = 0;
      for (const c of allCampaigns) {
        campaignsByStatus[c.status] = (campaignsByStatus[c.status] || 0) + 1;
        totalBudget += c.budget;
        totalSpent += c.spent;
      }

      const allAds: Ad[] = [];
      for (const c of allCampaigns) {
        let adPage = 0;
        while (true) {
          const res = await campaignsApi.getCampaignAds(c.id, { page: adPage, size: 50 });
          allAds.push(...res.content);
          if (res.last) break;
          adPage++;
        }
      }

      const adsByStatus: Record<string, number> = {};
      let flaggedAds = 0;
      for (const a of allAds) {
        adsByStatus[a.status] = (adsByStatus[a.status] || 0) + 1;
        if (a.status === "FLAGGED") flaggedAds++;
      }

      setStats({
        totalCampaigns: allCampaigns.length,
        campaignsByStatus,
        totalAds: allAds.length,
        adsByStatus,
        totalBudget,
        totalSpent,
        flaggedAds,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-skeleton rounded-lg" />
          <div className="flex gap-3">
            <div className="h-10 w-24 animate-skeleton rounded-xl" />
            <div className="h-10 w-32 animate-skeleton rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/ads">
            <Button variant="secondary">All ads</Button>
          </Link>
          <Link href="/review-queue">
            <Button>Review queue</Button>
          </Link>
        </div>
      </div>

      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Campaigns" value={String(stats.totalCampaigns)} href="/campaigns" />
        <StatCard label="Total ads" value={String(stats.totalAds)} href="/admin/ads" />
        <StatCard label="Total budget" value={currency(stats.totalBudget)} />
        <StatCard label="Total spent" value={currency(stats.totalSpent)} />
      </div>

      {stats.flaggedAds > 0 && (
        <Link href="/review-queue">
          <Card className="border-pending/30 bg-pending/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <p className="text-sm font-medium text-pending">
              {stats.flaggedAds} ad{stats.flaggedAds !== 1 ? "s" : ""} flagged for review
            </p>
          </Card>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Campaigns by status
          </p>
          {Object.keys(stats.campaignsByStatus).length === 0 ? (
            <EmptyState
              illustration="campaigns"
              title="No campaigns"
              description="No campaigns have been created yet."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.campaignsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge status={status} />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Ads by status
          </p>
          {Object.keys(stats.adsByStatus).length === 0 ? (
            <EmptyState
              illustration="ads"
              title="No ads"
              description="No ads have been uploaded yet."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.adsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge status={status} />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </RequireAuth>
  );
}
