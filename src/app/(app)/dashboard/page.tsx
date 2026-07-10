"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage } from "@/lib/errors";
import * as analyticsApi from "@/lib/api/analytics";
import { AdvertiserAnalytics } from "@/lib/types";
import {
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react";

function StatCard({ label, value, icon, delay }: { label: string; value: string; icon: React.ReactNode; delay: number }) {
  return (
    <GlassCard delay={delay} glow="none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
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
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your advertising performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View campaigns
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/campaigns?new=1">
            <Button size="sm">
              <Plus className="size-4" />
              New campaign
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Campaigns"
          value={String(data.campaignCount)}
          icon={<Target className="size-5 text-primary" />}
          delay={0}
        />
        <StatCard
          label="Total spent"
          value={currency(data.totalSpent)}
          icon={<DollarSign className="size-5 text-primary" />}
          delay={0.1}
        />
        <StatCard
          label="Total budget"
          value={currency(data.totalBudget)}
          icon={<TrendingUp className="size-5 text-primary" />}
          delay={0.2}
        />
        <StatCard
          label="Total views"
          value={data.totalViews.toLocaleString()}
          icon={<Eye className="size-5 text-primary" />}
          delay={0.3}
        />
      </div>

      <GlassCard delay={0.4}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Campaigns by status</h3>
        </div>
        {Object.keys(data.campaignsByStatus).length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Target className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
            <Link href="/campaigns?new=1">
              <Button size="sm">
                <Plus className="size-4" />
                Create your first campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.campaignsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                <Badge status={status} />
                <span className="text-sm tabular-nums text-muted-foreground">{count}</span>
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
