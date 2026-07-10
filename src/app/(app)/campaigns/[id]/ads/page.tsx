"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Ad, AdAnalyticsRow } from "@/lib/types";
import {
  ArrowLeft,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  Film,
} from "lucide-react";

function CampaignAdsContent() {
  const params = useParams<{ id: string }>();
  const campaignId = Number(params.id);

  const [ads, setAds] = useState<Ad[]>([]);
  const [viewsByAdId, setViewsByAdId] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    (pageToLoad: number) => {
      setLoading(true);
      Promise.all([
        campaignsApi.getCampaignAds(campaignId, { page: pageToLoad, size: 10 }),
        campaignsApi.getCampaignAdsAnalytics(campaignId),
      ])
        .then(([adsPage, analyticsRows]) => {
          setAds(adsPage.content);
          setTotalPages(adsPage.totalPages);
          setPage(adsPage.number);
          const map: Record<number, number> = {};
          analyticsRows.forEach((row: AdAnalyticsRow) => {
            map[row.adId] = row.views;
          });
          setViewsByAdId(map);
          setError("");
        })
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setLoading(false));
    },
    [campaignId]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/campaigns/${campaignId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to campaign
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ads</h1>
        </div>
        <Link href={`/campaigns/${campaignId}/upload`}>
          <Button size="sm">
            <Upload className="size-4" />
            Upload ad
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading ads...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : ads.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 py-12 text-center">
          <Film className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No ads uploaded to this campaign yet.</p>
          <Link href={`/campaigns/${campaignId}/upload`}>
            <Button size="sm">
              <Upload className="size-4" />
              Upload your first ad
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3.5 font-medium">Title</th>
                  <th className="px-4 py-3.5 font-medium">Status</th>
                  <th className="px-4 py-3.5 font-medium">Locale</th>
                  <th className="px-4 py-3.5 font-medium">Views</th>
                  <th className="px-4 py-3.5 font-medium">Created</th>
                  <th className="px-4 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad, i) => (
                  <motion.tr
                    key={ad.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/ads/${ad.id}?campaignId=${campaignId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {ad.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={ad.status} />
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{ad.targetLocale}</td>
                    <td className="px-4 py-3.5 tabular-nums">{(viewsByAdId[ad.id] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/ads/${ad.id}?campaignId=${campaignId}`}>
                        <Button variant="secondary" size="sm">
                          <Eye className="size-3.5" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {ads.map((ad, i) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/ads/${ad.id}?campaignId=${campaignId}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {ad.title}
                  </Link>
                  <Badge status={ad.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{ad.targetLocale}</span>
                  <span className="tabular-nums">{(viewsByAdId[ad.id] ?? 0).toLocaleString()} views</span>
                </div>
                <div className="mt-3">
                  <Link href={`/ads/${ad.id}?campaignId=${campaignId}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="size-3.5" />
                      View
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => load(page - 1)}>
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CampaignAdsPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <CampaignAdsContent />
    </RequireAuth>
  );
}
