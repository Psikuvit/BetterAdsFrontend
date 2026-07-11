"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
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
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

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
    setDeleteTarget(null);
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
      <PageHeader
        title="All Ads"
        actions={
          <Link href="/admin">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        }
      />

      <SegmentedControl
        aria-label="Filter ads by status"
        value={filter}
        onChange={setFilter}
        options={statuses.map((s) => ({
          value: s,
          label: s === "ALL" ? `All (${ads.length})` : `${s} (${ads.filter((a) => a.status === s).length})`,
        }))}
      />

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
          <Table>
            <THead>
              <Th>Title</Th>
              <Th>Campaign</Th>
              <Th>Status</Th>
              <Th>Locale</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </THead>
            <TBody>
              {filtered.map((ad) => (
                <Tr key={ad.id}>
                  <Td className="font-medium text-neutral-900 dark:text-white">{ad.title || "Untitled"}</Td>
                  <Td>
                    <Link
                      href={`/campaigns/${ad.campaignId}`}
                      className="text-neutral-500 transition-colors hover:text-electric-blue hover:underline"
                    >
                      {ad.campaignName}
                    </Link>
                  </Td>
                  <Td>
                    <Badge status={ad.status} />
                  </Td>
                  <Td className="text-neutral-500">{ad.targetLocale || "—"}</Td>
                  <Td className="text-neutral-500">{new Date(ad.createdAt).toLocaleDateString()}</Td>
                  <Td>
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
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      )}
                      {CAN_DELETE.has(ad.status) && (
                        <Button
                          variant="danger"
                          className="px-2.5 py-1 text-xs"
                          loading={actingId === ad.id}
                          onClick={() => setDeleteTarget(ad.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this ad?"
        description="This will permanently delete the ad. This action can't be undone."
        confirmLabel="Delete"
        danger
        loading={actingId !== null}
        onConfirm={() => deleteTarget !== null && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
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
