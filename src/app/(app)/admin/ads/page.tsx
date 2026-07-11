"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Ad, Campaign } from "@/lib/types";

interface AdWithCampaign extends Ad {
  campaignName: string;
}

function AdminAllAdsContent() {
  const [ads, setAds] = useState<AdWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

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

  const filtered = filter === "ALL" ? ads : ads.filter((a) => a.status === filter);
  const statuses = ["ALL", "LIVE", "FLAGGED", "PENDING", "VALIDATING", "PROCESSING", "REJECTED", "FAILED"];

  if (loading) return <p className="text-sm text-neutral-500">Loading all ads...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-white">All Ads</h1>
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
                : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {s === "ALL" ? `All (${ads.length})` : `${s} (${ads.filter((a) => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-500">No ads match this filter.</p>
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
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3 font-medium">{ad.title || "Untitled"}</td>
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
                  <td className="px-4 py-3 text-neutral-500">{ad.targetLocale || "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/ads/${ad.id}?campaignId=${ad.campaignId}`}>
                        <Button variant="secondary" className="px-2.5 py-1 text-xs">
                          View
                        </Button>
                      </Link>
                      {ad.status === "FLAGGED" && (
                        <Link href="/review-queue">
                          <Button variant="secondary" className="px-2.5 py-1 text-xs">
                            Review
                          </Button>
                        </Link>
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
