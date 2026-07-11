"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import * as adsApi from "@/lib/api/ads";
import { Ad } from "@/lib/types";

interface EmbedEntry {
  ad: Ad;
  embedUrl: string;
}

export function CampaignPlayer({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast();
  const [playlist, setPlaylist] = useState<EmbedEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let page = 0;
      const allAds: Ad[] = [];
      while (true) {
        const res = await campaignsApi.getCampaignAds(campaignId, { page, size: 50 });
        allAds.push(...res.content);
        if (res.last) break;
        page++;
      }

      const liveAds = allAds.filter((a) => a.status === "LIVE");
      if (liveAds.length === 0) {
        setPlaylist([]);
        return;
      }

      const entries = await Promise.all(
        liveAds.map(async (ad) => {
          try {
            const link = await adsApi.getEmbedLink(ad.id);
            return { ad, embedUrl: link.embedUrl } as EmbedEntry;
          } catch {
            return null;
          }
        })
      );

      setPlaylist(entries.filter((e): e is EmbedEntry => e !== null));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const advance = useCallback(() => {
    if (playlist.length <= 1) return;
    setIndex((i) => (i + 1) % playlist.length);
  }, [playlist.length]);

  useEffect(() => {
    if (playlist.length === 0) return;

    function onMsg(ev: MessageEvent) {
      if (ev.data?.type === "ad-ended" || ev.data?.type === "ended" || ev.data?.type === "complete") {
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = null;
        }
        advance();
      }
    }

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [playlist, advance]);

  useEffect(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (playlist.length > 1) {
      advanceTimerRef.current = setTimeout(() => {
        advance();
      }, 30000);
    }

    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, [index, playlist, advance]);

  if (loading) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Loading playlist...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (playlist.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No live ads to play.
      </p>
    );
  }

  const current = playlist[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
        <iframe
          ref={iframeRef}
          key={`${current.ad.id}-${index}`}
          src={current.embedUrl}
          width="100%"
          height={360}
          frameBorder={0}
          allow="autoplay; fullscreen"
          onLoad={(e) => {
            const iframe = e.currentTarget;
            function onResize(ev: MessageEvent) {
              if (ev.data?.type === "ad-resize" && ev.data.width && ev.data.height) {
                const ratio = ev.data.height / ev.data.width;
                iframe.style.height = `${iframe.clientWidth * ratio}px`;
              }
            }
            window.addEventListener("message", onResize);
            iframe.addEventListener("remove", () => window.removeEventListener("message", onResize));
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
          {current.ad.title || `Ad #${current.ad.id}`}
          <span className="ml-2 text-neutral-400 dark:text-neutral-600">
            {index + 1}/{playlist.length}
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-xs"
            onClick={() => setIndex((i) => (i - 1 + playlist.length) % playlist.length)}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-xs"
            onClick={() => setIndex((i) => (i + 1) % playlist.length)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
