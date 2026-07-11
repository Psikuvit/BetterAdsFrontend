"use client";

import { SubmitEvent, useCallback, useEffect, useState } from "react";
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
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FundCampaignPanel } from "@/components/FundCampaignPanel";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Campaign, CampaignAnalytics, CampaignStatus, CampaignTimeseriesPoint } from "@/lib/types";

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

  async function handleSave(e: SubmitEvent<HTMLFormElement>) {
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-skeleton rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <div className="h-4 w-20 animate-skeleton rounded mb-3" />
            <div className="h-4 w-full animate-skeleton rounded mb-2" />
            <div className="h-4 w-2/3 animate-skeleton rounded" />
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="h-4 w-24 animate-skeleton rounded mb-3" />
            <div className="h-10 w-full animate-skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!campaign) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/campaigns"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← Back to campaigns
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">{campaign.name || "Untitled campaign"}</h1>
            <Badge status={campaign.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={campaign.status}
            disabled={statusSaving}
            onChange={(e) => handleStatusChange(e.target.value as CampaignStatus)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm capitalize text-neutral-900 outline-none transition-colors focus:border-electric-blue disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Link href={`/campaigns/${campaignId}/ads`}>
            <Button variant="secondary">Ads</Button>
          </Link>
          <Link href={`/campaigns/${campaignId}/upload`}>
            <Button variant="secondary">Upload ad</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Details</p>
            <button
              onClick={() => setEditing((e) => !e)}
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
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
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <Button type="submit" loading={saving} className="self-start">
                Save changes
              </Button>
            </form>
          ) : (
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Budget</dt>
                <dd className="text-neutral-900 dark:text-white">${campaign.budget.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Spent</dt>
                <dd className="text-neutral-900 dark:text-white">${campaign.spent.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
                <dd className="text-neutral-900 dark:text-white">{new Date(campaign.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Fund campaign
          </p>
          <FundCampaignPanel campaignId={campaignId} onFunded={refreshAll} />
        </Card>
      </div>

      {analytics && (
        <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total views</p>
            <p className="mt-2 font-mono text-2xl text-neutral-900 dark:text-white">{analytics.totalViews.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total ads</p>
            <p className="mt-2 font-mono text-2xl text-neutral-900 dark:text-white">{analytics.totalAds}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Spent</p>
            <p className="mt-2 font-mono text-2xl text-neutral-900 dark:text-white">${analytics.spent.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Budget</p>
            <p className="mt-2 font-mono text-2xl text-neutral-900 dark:text-white">${analytics.budget.toFixed(2)}</p>
          </Card>
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Views over time
          </p>
          <div className="flex gap-1">
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                  days === d
                    ? "bg-gradient-brand text-white shadow-glow-blue"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/70"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {timeseries.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No views recorded in this period.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="date" fontSize={12} stroke="currentColor" opacity={0.6} />
                <YAxis fontSize={12} stroke="currentColor" opacity={0.6} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(19,19,24,0.95)",
                    color: "#ededed",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#06B6D4", stroke: "none" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
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
