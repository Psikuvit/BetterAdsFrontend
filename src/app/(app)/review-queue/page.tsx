"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import * as adsApi from "@/lib/api/ads";
import { Ad, Campaign } from "@/lib/types";

interface QueueItem {
  ad: Ad;
  campaignName: string;
}

async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<{ content: T[]; totalPages: number }>
): Promise<T[]> {
  const first = await fetchPage(0);
  const all = [...first.content];
  for (let p = 1; p < first.totalPages; p++) {
    const next = await fetchPage(p);
    all.push(...next.content);
  }
  return all;
}

function ReviewQueueContent() {
  const { showToast } = useToast();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const campaigns: Campaign[] = await fetchAllPages((page) =>
        campaignsApi.listCampaigns({ page, size: 50 })
      );

      const results: QueueItem[] = [];
      for (const campaign of campaigns) {
        const ads: Ad[] = await fetchAllPages((page) =>
          campaignsApi.getCampaignAds(campaign.id, { page, size: 50 })
        );
        for (const ad of ads) {
          if (ad.status === "FLAGGED") {
            results.push({ ad, campaignName: campaign.name || `Campaign #${campaign.id}` });
          }
        }
      }
      setItems(results);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleResolve(adId: number, decision: "approve" | "reject") {
    setResolvingId(adId);
    try {
      await adsApi.reviewAd(adId, decision);
      setItems((prev) => prev.filter((i) => i.ad.id !== adId));
      showToast(`Ad ${decision === "approve" ? "approved" : "rejected"}`, "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Review queue</h1>
        <p className="mt-1 text-sm text-neutral-500">
          There&apos;s no dedicated flagged-ads endpoint yet, so this scans every campaign&apos;s
          ads client-side — it may take a moment on large accounts.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Scanning campaigns for flagged ads...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-500">Nothing flagged for review right now.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ ad, campaignName }) => (
            <Card key={ad.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{ad.title}</p>
                <p className="text-sm text-neutral-500">
                  {campaignName} · Ad #{ad.id} · {ad.targetLocale}
                </p>
                <Link
                  href={`/ads/${ad.id}?campaignId=${ad.campaignId}`}
                  className="text-sm text-neutral-500 underline hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  View ad
                </Link>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  loading={resolvingId === ad.id}
                  onClick={() => handleResolve(ad.id, "reject")}
                >
                  Reject
                </Button>
                <Button loading={resolvingId === ad.id} onClick={() => handleResolve(ad.id, "approve")}>
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewQueuePage() {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <ReviewQueueContent />
    </RequireAuth>
  );
}
