"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdPlayer } from "@betterads/react";
import type { EventType } from "@betterads/sdk-core";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as placementsApi from "@/lib/api/placements";
import { API_BASE_URL } from "@/lib/config";

// Dogfoods the placements API from inside the dashboard as its own "preview
// site" (registered via /sites with no origin/bundle-ID restriction) rather
// than a real publisher embed -- see .env.example for how to set this up.
const PREVIEW_SITE_KEY = process.env.NEXT_PUBLIC_PREVIEW_SITE_KEY || "";

const VIEWER_ID_STORAGE_KEY = "betterads.previewViewerId";

function getOrCreateViewerId(): string {
  let id = window.localStorage.getItem(VIEWER_ID_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VIEWER_ID_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Replaces the old client-side "fetch every live ad, cycle every 30s"
 * iframe rotation with server-driven ad selection: each ad is chosen by
 * POST /api/v1/placements/{siteKey}/select (frequency-cap aware), then
 * rendered via @betterads/react's <AdPlayer/> (session + event API, no
 * iframe). When the SDK reports the ad finished or errored, this asks
 * the server to select the next one.
 *
 * Trade-off worth knowing: this is no longer a client-controlled playlist,
 * so the old manual Prev/Next buttons are gone -- the server decides what
 * plays next, same as a real publisher embed would experience. That's
 * needed for frequency capping/pacing to work server-side, but it does
 * mean this is now a faithful *preview* of the viewer experience rather
 * than an advertiser-controlled rotation browser.
 */
export function CampaignPlayer({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast();
  const [adId, setAdId] = useState<number | null>(null);
  const [round, setRound] = useState(0); // bumped to force <AdPlayer/> to remount for the next ad
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const viewerIdRef = useRef<string>("");

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!viewerIdRef.current) {
        viewerIdRef.current = getOrCreateViewerId();
      }
      const res = await placementsApi.selectAd(PREVIEW_SITE_KEY, {
        campaignId,
        viewerId: viewerIdRef.current,
      });
      setAdId(res.adId);
      setRound((r) => r + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (!PREVIEW_SITE_KEY) return;
    loadNext();
  }, [loadNext]);

  function handleEvent(type: EventType) {
    if (type === "COMPLETE" || type === "ERROR") {
      loadNext();
    }
  }

  function handlePlayerError(err: unknown) {
    showToast(errorMessage(err), "error");
  }

  if (!PREVIEW_SITE_KEY) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Set <code>NEXT_PUBLIC_PREVIEW_SITE_KEY</code> (register a site under{" "}
        <a href="/sites" className="underline">
          /sites
        </a>
        ) to preview live ad playback here.
      </p>
    );
  }

  if (loading && adId === null) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Loading ad...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (adId === null) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No live ads to play.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
        <AdPlayer
          key={round}
          baseUrl={API_BASE_URL}
          siteKey={PREVIEW_SITE_KEY}
          adId={adId}
          style={{ width: "100%", aspectRatio: "16 / 9" }}
          onEvent={handleEvent}
          onError={handlePlayerError}
        />
      </div>
    </div>
  );
}
