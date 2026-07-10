"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { FundCampaignPanel } from "@/components/FundCampaignPanel";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Campaign, CampaignAnalytics, CampaignStatus, CampaignTimeseriesPoint } from "@/lib/types";
import {
  ArrowLeft,
  Upload,
  List,
  Edit3,
  Eye,
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  Save,
  X,
} from "lucide-react";

const STATUS_OPTIONS: CampaignStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

function CampaignDetailContent() {
  const params = useParams<{ id: string }>();
  const campaignId = Number(params.id);
  const { showToast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [timeseries, setTimeseries] = useState<CampaignTimeseriesPoint[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const loadCampaign = useCallback(() => {
    return campaignsApi.getCampaign(campaignId).then((c) => {
      setCampaign(c);
      setName(c.name);
      setBudget(String(c.budget));
    });
  }, [campaignId]);

  const loadAnalytics = useCallback(() => {
    return campaignsApi.getCampaignAnalytics(campaignId).then(setAnalytics);
  }, [campaignId]);

  const loadTimeseries = useCallback(
    (d: number) => campaignsApi.getCampaignTimeseries(campaignId, d).then(setTimeseries),
    [campaignId]
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([loadCampaign(), loadAnalytics(), loadTimeseries(days)])
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  useEffect(() => {
    loadTimeseries(days).catch((err) => showToast(errorMessage(err), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await campaignsApi.updateCampaign(campaignId, { name, budget });
      await loadCampaign();
      setEditing(false);
      showToast("Campaign updated", "success");
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: CampaignStatus) {
    setStatusSaving(true);
    try {
      await campaignsApi.updateCampaignStatus(campaignId, newStatus);
      await loadCampaign();
      showToast(`Status changed to ${newStatus}`, "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setStatusSaving(false);
    }
  }

  function refreshAll() {
    loadCampaign();
    loadAnalytics();
  }

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Loading campaign...
    </div>
  );
  
  if (error) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">{error}</div>
    </div>
  );
  
  if (!campaign) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to campaigns
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {campaign.name || "Untitled campaign"}
            </h1>
            <Badge status={campaign.status} />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={campaign.status}
              disabled={statusSaving}
              onChange={(e) => handleStatusChange(e.target.value as CampaignStatus)}
              className="h-8 rounded-md border border-input bg-card px-2.5 py-1 text-sm capitalize outline-none transition-all duration-200 focus:border-ring focus:ring-[3px] focus:ring-ring/50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Link href={`/campaigns/${campaignId}/ads`}>
              <Button variant="secondary" size="sm">
                <List className="size-4" />
                Ads
              </Button>
            </Link>
            <Link href={`/campaigns/${campaignId}/upload`}>
              <Button variant="secondary" size="sm">
                <Upload className="size-4" />
                Upload ad
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard delay={0}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Details</h3>
            <button
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {editing ? <X className="size-4" /> : <Edit3 className="size-4" />}
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
          {editing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                label="Budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              {saveError && <p className="text-xs text-destructive">{saveError}</p>}
              <Button type="submit" loading={saving} className="self-start">
                <Save className="size-4" />
                Save changes
              </Button>
            </form>
          ) : (
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <dt className="text-muted-foreground">Budget</dt>
                <dd className="tabular-nums font-medium">${campaign.budget.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <dt className="text-muted-foreground">Spent</dt>
                <dd className="tabular-nums font-medium">${campaign.spent.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="text-foreground">{new Date(campaign.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </GlassCard>

        <GlassCard delay={0.1}>
          <h3 className="text-sm font-medium text-foreground mb-4">Fund campaign</h3>
          <FundCampaignPanel campaignId={campaignId} onFunded={refreshAll} />
        </GlassCard>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total views", value: analytics.totalViews.toLocaleString(), icon: <Eye className="size-5 text-primary" />, delay: 0.2 },
            { label: "Total ads", value: String(analytics.totalAds), icon: <Target className="size-5 text-primary" />, delay: 0.25 },
            { label: "Spent", value: `$${analytics.spent.toFixed(2)}`, icon: <DollarSign className="size-5 text-primary" />, delay: 0.3 },
            { label: "Budget", value: `$${analytics.budget.toFixed(2)}`, icon: <TrendingUp className="size-5 text-primary" />, delay: 0.35 },
          ].map((stat) => (
            <GlassCard key={stat.label} delay={stat.delay} glow="none">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {stat.icon}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassCard delay={0.4}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Views over time</h3>
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  days === d
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {timeseries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <BarChart3 className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No views recorded in this period.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="date" fontSize={12} stroke="currentColor" opacity={0.4} tickLine={false} />
                <YAxis fontSize={12} stroke="currentColor" opacity={0.4} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--color-border, #e5e5e5)",
                    background: "var(--color-card, #ffffff)",
                    color: "var(--color-foreground, #050507)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#4F46E5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <CampaignDetailContent />
    </RequireAuth>
  );
}
