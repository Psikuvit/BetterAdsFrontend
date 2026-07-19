"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/errors";
import * as adsApi from "@/lib/api/ads";

/**
 * Not a real placement: fetches the ad's own video directly via
 * GET /api/ads/{id}/preview (authenticated, ownership-checked, skips
 * billing/fraud/view-token logic -- see AdController#preview), so an
 * advertiser previewing this single ad here never counts as a served
 * impression and never needs a registered site key. For all LIVE ads in a
 * campaign at once, see DummyPlaylistPlayer -- the actual, tracked,
 * site-key-based playlist a publisher gets on their own site comes from
 * GET /embed/{token} instead, not from anything in this dashboard.
 */
export function DummyAdPlayer({ adId }: { adId: number }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setVideoUrl(null);
    setError("");
    adsApi
      .getAdPreview(adId)
      .then((res) => {
        if (!cancelled) setVideoUrl(res.videoUrl);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [adId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  if (!videoUrl) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Loading preview...
      </p>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
      <video
        src={videoUrl}
        controls
        muted
        playsInline
        style={{ width: "100%", aspectRatio: "16 / 9", display: "block", background: "#000" }}
      />
      <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        Preview only · not tracked
      </span>
    </div>
  );
}
