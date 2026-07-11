"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as adsApi from "@/lib/api/ads";
import * as campaignsApi from "@/lib/api/campaigns";
import { Ad, Campaign, EmbedLink, AdValidation } from "@/lib/types";

function AdDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const adId = Number(params.id);
  const campaignId = Number(searchParams.get("campaignId"));
  const { showToast } = useToast();

  const [ad, setAd] = useState<Ad | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [embed, setEmbed] = useState<EmbedLink | null>(null);
  const [validation, setValidation] = useState<AdValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const promises: Promise<unknown>[] = [];

      if (campaignId) {
        promises.push(
          campaignsApi.getCampaign(campaignId).then(setCampaign),
          campaignsApi.getCampaignAds(campaignId, { page: 0, size: 100 }).then((page) => {
            const found = page.content.find((a) => a.id === adId);
            if (found) setAd(found);
          })
        );
      }

      promises.push(
        adsApi.getEmbedLink(adId).then(setEmbed).catch(() => {}),
        adsApi.getAdValidation(adId).then(setValidation).catch(() => {})
      );

      await Promise.all(promises);

      if (!campaignId) {
        setError("Missing campaignId query parameter");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [adId, campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`, "success");
    } catch {
      showToast("Couldn't copy to clipboard", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-skeleton rounded-lg" />
        <div className="glass rounded-2xl p-5">
          <div className="h-4 w-32 animate-skeleton rounded mb-3" />
          <div className="h-4 w-full animate-skeleton rounded mb-2" />
          <div className="h-4 w-2/3 animate-skeleton rounded" />
        </div>
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ad?.title || `Ad #${adId}`}
        status={ad?.status}
        backHref={campaignId ? `/campaigns/${campaignId}/ads` : "/campaigns"}
        backLabel={campaign ? `Back to ${campaign.name}` : "Back to campaigns"}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Details
          </p>
          <dl className="flex flex-col gap-2 text-sm">
            {ad && (
              <>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Title</dt>
                  <dd className="text-neutral-900 dark:text-white">{ad.title || "Untitled"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Status</dt>
                  <dd><Badge status={ad.status} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Locale</dt>
                  <dd className="text-neutral-900 dark:text-white">{ad.targetLocale || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
                  <dd className="text-neutral-900 dark:text-white">
                    {new Date(ad.createdAt).toLocaleString()}
                  </dd>
                </div>
              </>
            )}
            {campaign && (
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Campaign</dt>
                <dd>
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="text-electric-blue transition-colors hover:text-neon-cyan hover:underline"
                  >
                    {campaign.name || `Campaign #${campaign.id}`}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {validation && (
          <Card>
            <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Validation
            </p>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Status</dt>
                <dd><Badge status={validation.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">In human review</dt>
                <dd className="text-neutral-900 dark:text-white">
                  {validation.inHumanReview ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </div>

      {embed && (
        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Embed
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-neutral-100 px-3 py-2 text-xs dark:bg-neutral-800">
                {embed.embedUrl}
              </code>
              <Button variant="secondary" onClick={() => copy(embed.embedUrl, "Embed URL")}>
                Copy
              </Button>
            </div>
            <div className="flex items-start gap-2">
              <pre className="flex-1 overflow-x-auto rounded-md bg-neutral-100 px-3 py-2 text-xs dark:bg-neutral-800">
                {embed.embedSnippet}
              </pre>
              <Button variant="secondary" onClick={() => copy(embed.embedSnippet, "Embed snippet")}>
                Copy
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
              <iframe
                src={embed.embedUrl}
                width="100%"
                height={360}
                frameBorder={0}
                allow="autoplay; fullscreen"
                onLoad={(e) => {
                  const iframe = e.currentTarget;
                  function onMsg(ev: MessageEvent) {
                    if (ev.data?.type === "ad-resize" && ev.data.width && ev.data.height) {
                      const ratio = ev.data.height / ev.data.width;
                      iframe.style.height = `${iframe.clientWidth * ratio}px`;
                    }
                  }
                  window.addEventListener("message", onMsg);
                  iframe.addEventListener("remove", () => window.removeEventListener("message", onMsg));
                }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AdDetailPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <AdDetailContent />
    </RequireAuth>
  );
}
