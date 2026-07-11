"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import * as adsApi from "@/lib/api/ads";
import { Ad, AdAnalyticsRow, AdStatus } from "@/lib/types";

const LOCALE_OPTIONS = [{ code: "fr", label: "French" }];

function FeaturePicker({ adId, onDone }: { adId: number; onDone: () => void }) {
  const [selected, setSelected] = useState<string[]>(["fr"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  function toggle(code: string) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function handleGenerate() {
    if (selected.length === 0) { setError("Choose at least one locale."); return; }
    setError("");
    setSubmitting(true);
    try {
      await adsApi.selectFeatures(adId, selected);
      showToast("Processing started", "success");
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    setSubmitting(true);
    try {
      await adsApi.selectFeatures(adId, []);
      showToast("Ad is now live", "success");
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {LOCALE_OPTIONS.map((locale) => {
        const active = selected.includes(locale.code);
        return (
          <button
            key={locale.code}
            type="button"
            disabled={submitting}
            onClick={() => toggle(locale.code)}
            className={`rounded-md border px-2 py-0.5 text-xs transition-colors disabled:cursor-not-allowed ${
              active
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {locale.label}
          </button>
        );
      })}
      <Button onClick={handleGenerate} loading={submitting} className="px-2 py-0.5 text-xs">
        Generate
      </Button>
      <Button variant="secondary" loading={submitting} onClick={handleSkip} className="px-2 py-0.5 text-xs">
        Skip
      </Button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CampaignAdsContent() {
  const params = useParams<{ id: string }>();
  const campaignId = Number(params.id);
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const { showToast } = useToast();

  const [ads, setAds] = useState<Ad[]>([]);
  const [viewsByAdId, setViewsByAdId] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  async function handleDelete(adId: number) {
    if (!confirm("Delete this ad permanently?")) return;
    setDeletingId(adId);
    try {
      await adsApi.deleteAd(adId);
      setAds((prev) => prev.filter((a) => a.id !== adId));
      showToast("Ad deleted", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setDeletingId(null);
    }
  }

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
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                    {ad.title}
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
                    {ad.status === "AWAITING_FEATURES" ? (
                      <FeaturePicker adId={ad.id} onDone={() => load(page)} />
                    ) : (
                      <div className="flex gap-1.5">
                        {isAdmin && (
                          <Button
                            variant="danger"
                            className="px-2.5 py-1 text-xs"
                            loading={deletingId === ad.id}
                            onClick={() => handleDelete(ad.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
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
