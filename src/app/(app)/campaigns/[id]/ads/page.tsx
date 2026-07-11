"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
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
      <PageHeader
        title="Ads"
        backHref={`/campaigns/${campaignId}`}
        backLabel="Back to campaign"
        actions={
          <Link href={`/campaigns/${campaignId}/upload`}>
            <Button>Upload ad</Button>
          </Link>
        }
      />

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
          <Table>
            <THead>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Locale</Th>
              <Th>Views</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </THead>
            <TBody>
              {ads.map((ad) => (
                <Tr key={ad.id}>
                  <Td>
                    <Link
                      href={`/ads/${ad.id}?campaignId=${campaignId}`}
                      className="font-medium text-neutral-900 hover:underline dark:text-white"
                    >
                      {ad.title}
                    </Link>
                  </Td>
                  <Td>
                    <Badge status={ad.status} />
                  </Td>
                  <Td className="text-neutral-500">{ad.targetLocale}</Td>
                  <Td className="text-neutral-700 dark:text-neutral-100">{(viewsByAdId[ad.id] ?? 0).toLocaleString()}</Td>
                  <Td className="text-neutral-500">{new Date(ad.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Link href={`/ads/${ad.id}?campaignId=${campaignId}`}>
                      <Button variant="secondary" className="px-2.5 py-1 text-xs">
                        View
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
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
