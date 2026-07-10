"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import * as adsApi from "@/lib/api/ads";
import { Ad, Campaign } from "@/lib/types";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

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
        <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve or reject flagged ads before they go live.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Scanning campaigns for flagged ads...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 py-12 text-center">
          <ShieldCheck className="size-10 text-success/60" />
          <p className="text-sm text-muted-foreground">Nothing flagged for review right now.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ ad, campaignName }, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <GlassCard hover={false}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{ad.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {campaignName} &middot; Ad #{ad.id} &middot; {ad.targetLocale}
                    </p>
                    <Link
                      href={`/ads/${ad.id}?campaignId=${ad.campaignId}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-1"
                    >
                      <ExternalLink className="size-3.5" />
                      View ad
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={resolvingId === ad.id}
                      onClick={() => handleResolve(ad.id, "reject")}
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      loading={resolvingId === ad.id}
                      onClick={() => handleResolve(ad.id, "approve")}
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
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
