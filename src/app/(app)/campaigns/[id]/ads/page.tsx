"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Ad, AdAnalyticsRow } from "@/lib/types";

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
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← Back to campaign
          </Link>
          <h1 className="mt-1 text-2xl font-medium text-neutral-900 dark:text-white">Ads</h1>
        </div>
        <Link href={`/campaigns/${campaignId}/upload`}>
          <Button>Upload ad</Button>
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : ads.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            illustration="ads"
            title="No ads yet"
            description="Upload your first ad to this campaign."
            action={{ label: "Upload ad", onClick: () => {} }}
          />
        </Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Locale</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/ads/${ad.id}?campaignId=${campaignId}`}
                      className="font-medium text-neutral-900 hover:underline dark:text-white"
                    >
                      {ad.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={ad.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{ad.targetLocale}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-100">{(viewsByAdId[ad.id] ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/ads/${ad.id}?campaignId=${campaignId}`}>
                      <Button variant="secondary" className="px-2.5 py-1 text-xs">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" disabled={page === 0} onClick={() => load(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages - 1}
            onClick={() => load(page + 1)}
          >
            Next
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
