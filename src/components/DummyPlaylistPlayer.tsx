"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { AdPreview } from "@/lib/types";

/**
 * Not a real placement: fetches every LIVE ad in the campaign directly via
 * GET /api/campaigns/{id}/preview (authenticated, ownership-checked, skips
 * billing/fraud/view-token logic -- see AdPreviewService/CampaignController#
 * preview) and cycles through them client-side. So an advertiser previewing
 * their whole campaign here never counts as served impressions and never
 * needs a registered site key -- unlike the real, tracked playlist a
 * publisher gets from GET /embed/{token} on their own site.
 */
export function DummyPlaylistPlayer({ campaignId }: { campaignId: number }) {
  const [ads, setAds] = useState<AdPreview[] | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setAds(null);
    setIndex(0);
    setError("");
    campaignsApi
      .getCampaignPreview(campaignId)
      .then((res) => {
        if (!cancelled) setAds(res);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  function advance() {
    setIndex((i) => (ads && ads.length > 0 ? (i + 1) % ads.length : 0));
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  if (!ads) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Loading playlist...
      </p>
    );
  }

  if (ads.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No live ads to preview.
      </p>
    );
  }

  const current = ads[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
        <video
          key={current.adId}
          src={current.videoUrl}
          autoPlay
          muted
          playsInline
          onEnded={advance}
          onError={advance}
          style={{ width: "100%", aspectRatio: "16 / 9", display: "block", background: "#000" }}
        />
        <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
          Playlist preview · not tracked
        </span>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Ad {index + 1} of {ads.length}
      </p>
    </div>
  );
}
