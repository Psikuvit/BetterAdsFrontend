"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as adsApi from "@/lib/api/ads";
import { subscribeAdEvents } from "@/lib/sse";
import { AdStatus, AdValidation, EmbedLink } from "@/lib/types";

const STATUS_NOTES: Record<AdStatus, string> = {
  pending: "Your ad is queued for processing.",
  validating: "Content is being validated.",
  processing: "Translation and speech processing in progress.",
  live: "Your ad is live and ready to embed.",
  flagged: "This ad was flagged and is waiting on human review.",
  rejected: "This ad was rejected.",
  failed: "Processing failed for this ad.",
};

function AdDetailContent() {
  const params = useParams<{ id: string }>();
  const adId = Number(params.id);
  const { showToast } = useToast();

  const [validation, setValidation] = useState<AdValidation | null>(null);
  const [embed, setEmbed] = useState<EmbedLink | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadValidation = useCallback(() => {
    return adsApi.getAdValidation(adId).then(setValidation);
  }, [adId]);

  const loadEmbed = useCallback(() => {
    adsApi
      .getEmbedLink(adId)
      .then(setEmbed)
      .catch(() => {
        // link isn't available yet
      });
  }, [adId]);

  useEffect(() => {
    setLoading(true);
    loadValidation()
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [loadValidation]);

  useEffect(() => {
    if (validation?.status === "live") {
      loadEmbed();
    }
  }, [validation?.status, loadEmbed]);

  useEffect(() => {
    const unsubscribe = subscribeAdEvents(
      adId,
      (event) => {
        setValidation({
          adId: event.adId,
          status: event.status as AdStatus,
          inHumanReview: event.status === "flagged",
        });
      },
      () => {
        // SSE unavailable — fall back to polling /validation every 3s
        if (!pollRef.current) {
          pollRef.current = setInterval(() => {
            loadValidation().catch(() => {});
          }, 3000);
        }
      }
    );

    return () => {
      unsubscribe();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [adId, loadValidation]);

  useEffect(() => {
    if (validation && ["live", "rejected", "failed"].includes(validation.status) && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [validation]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`, "success");
    } catch {
      showToast("Couldn't copy to clipboard", "error");
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading ad...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!validation) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Ad #{validation.adId}</h1>
        <Badge status={validation.status} />
      </div>

      <Card>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {STATUS_NOTES[validation.status]}
        </p>
        {validation.inHumanReview && (
          <p className="mt-2 text-sm text-amber-600">
            An admin needs to approve or reject this ad before it can go live.
          </p>
        )}
      </Card>

      {validation.status === "live" && (
        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Embed
          </p>
          {embed ? (
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
                <Button
                  variant="secondary"
                  onClick={() => copy(embed.embedSnippet, "Embed snippet")}
                >
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
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Loading embed link...</p>
          )}
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
