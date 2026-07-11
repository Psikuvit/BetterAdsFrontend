"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import * as adsApi from "@/lib/api/ads";
import { Ad, Campaign } from "@/lib/types";

interface AdWithCampaign extends Ad {
  campaignName: string;
}

const CAN_REJECT = new Set(["PENDING", "VALIDATING", "AWAITING_FEATURES", "FLAGGED", "PROCESSING"]);
const CAN_DELETE = new Set(["PENDING", "VALIDATING", "AWAITING_FEATURES", "FLAGGED", "REJECTED", "FAILED"]);

function AdminAllAdsContent() {
  const { showToast } = useToast();
  const [ads, setAds] = useState<AdWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [actingId, setActingId] = useState<number | null>(null);

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

      const allAds: AdWithCampaign[] = [];
      for (const c of allCampaigns) {
        let adPage = 0;
        while (true) {
          const res = await campaignsApi.getCampaignAds(c.id, { page: adPage, size: 50 });
          for (const a of res.content) {
            allAds.push({ ...a, campaignName: c.name || `Campaign #${c.id}` });
          }
          if (res.last) break;
          adPage++;
        }
      }

      allAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAds(allAds);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReject(adId: number) {
    setActingId(adId);
    try {
      await adsApi.reviewAd(adId, "reject");
      setAds((prev) => prev.map((a) => (a.id === adId ? { ...a, status: "REJECTED" as const } : a)));
      showToast("Ad rejected", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete(adId: number) {
    if (!confirm("Delete this ad permanently?")) return;
    setActingId(adId);
    try {
      await adsApi.deleteAd(adId);
      setAds((prev) => prev.filter((a) => a.id !== adId));
      showToast("Ad deleted", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setActingId(null);
    }
  }

  const filtered = filter === "ALL" ? ads : ads.filter((a) => a.status === filter);
  const statuses = ["ALL", "LIVE", "FLAGGED", "PENDING", "VALIDATING", "PROCESSING", "REJECTED", "FAILED"];

  if (loading) return <TableSkeleton rows={8} />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">All Ads</h1>
        <Link href="/admin">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
              filter === s
                ? "bg-gradient-brand text-white shadow-glow-blue"
                : "border border-neutral-200 bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/70"
            }`}
          >
            {s === "ALL" ? `All (${ads.length})` : `${s} (${ads.filter((a) => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            illustration="search"
            title="No ads match this filter"
            description="Try selecting a different status filter."
          />
        </Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Locale</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ad) => (
                <tr
                  key={ad.id}
                  className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{ad.title || "Untitled"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/campaigns/${ad.campaignId}`}
                      className="text-neutral-500 transition-colors hover:text-electric-blue hover:underline"
                    >
                      {ad.campaignName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={ad.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{ad.targetLocale || "\u2014"}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/campaigns/${ad.campaignId}/ads`}>
                        <Button variant="secondary" className="px-2.5 py-1 text-xs">
                          Campaign
                        </Button>
                      </Link>
                      {CAN_REJECT.has(ad.status) && ad.status !== "REJECTED" && (
                        <Button
                          variant="secondary"
                          className="px-2.5 py-1 text-xs"
                          loading={actingId === ad.id}
                          onClick={() => handleReject(ad.id)}
                        >
                          Reject
                        </Button>
                      )}
                      {CAN_DELETE.has(ad.status) && (
                        <Button
                          variant="danger"
                          className="px-2.5 py-1 text-xs"
                          loading={actingId === ad.id}
                          onClick={() => handleDelete(ad.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default function AdminAllAdsPage() {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <AdminAllAdsContent />
    </RequireAuth>
  );
}
