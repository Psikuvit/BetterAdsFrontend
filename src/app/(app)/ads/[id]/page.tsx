"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Check, Copy, Trash2, X } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as adsApi from "@/lib/api/ads";
import { subscribeAdEvents } from "@/lib/sse";
import { AdStatus, AdValidation, EmbedLink } from "@/lib/types";

const STATUS_NOTES: Record<AdStatus, string> = {
  PENDING: "Your ad is queued for processing.",
  VALIDATING: "Content is being validated.",
  AWAITING_FEATURES: "Your ad passed validation. Choose which locales to generate below.",
  PROCESSING: "Translation and speech processing in progress.",
  LIVE: "Your ad is live and ready to embed.",
  FLAGGED: "This ad was flagged and is waiting on human review.",
  REJECTED: "This ad was rejected.",
  FAILED: "Processing failed for this ad.",
};

const LOCALE_OPTIONS = [
  { code: "fr", label: "French" },
];

const WAITING_STATUSES: AdStatus[] = ["PENDING", "VALIDATING"];
const TERMINAL_STATUSES: AdStatus[] = ["LIVE", "REJECTED", "FAILED"];

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ValidationTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      <span className="font-mono text-sm text-neutral-500">{formatElapsed(seconds)}</span>
    </div>
  );
}

function ProcessingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
    </div>
  );
}

function FeatureSelectionForm({ adId, onSubmitted }: { adId: number; onSubmitted: () => void }) {
  const [selected, setSelected] = useState<string[]>(["fr"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggle(code: string) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function handleSubmit() {
    if (selected.length === 0) {
      setError("Choose at least one locale.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await adsApi.selectFeatures(adId, selected);
      onSubmitted();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Translate to
      </p>
      <SegmentedControl
        aria-label="Translate to"
        multiple
        disabled={submitting}
        value={selected}
        onChange={toggle}
        options={LOCALE_OPTIONS.map((locale) => ({ value: locale.code, label: locale.label }))}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} loading={submitting} className="self-start">
          Generate
        </Button>
        <Button
          variant="secondary"
          loading={submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await adsApi.selectFeatures(adId, []);
              onSubmitted();
            } catch (err) {
              setError(errorMessage(err));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          Skip translation
        </Button>
      </div>
    </div>
  );
}

function AdDetailContent() {
  const params = useParams<{ id: string }>();
  const adId = Number(params.id);
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaignId");
  const { showToast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [validation, setValidation] = useState<AdValidation | null>(null);
  const [embed, setEmbed] = useState<EmbedLink | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
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
    if (validation?.status === "LIVE") {
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
          inHumanReview: event.status === "FLAGGED",
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
    if (validation && TERMINAL_STATUSES.includes(validation.status) && pollRef.current) {
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

  const CAN_REJECT = new Set<AdStatus>(["PENDING", "VALIDATING", "AWAITING_FEATURES", "FLAGGED", "PROCESSING"]);
  const CAN_DELETE = new Set<AdStatus>(["PENDING", "VALIDATING", "AWAITING_FEATURES", "FLAGGED", "REJECTED", "FAILED"]);

  async function handleReject() {
    setActing(true);
    try {
      await adsApi.reviewAd(adId, "reject");
      setValidation((v) => v ? { ...v, status: "REJECTED", inHumanReview: false } : v);
      showToast("Ad rejected", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    setConfirmDeleteOpen(false);
    setActing(true);
    try {
      await adsApi.deleteAd(adId);
      showToast("Ad deleted", "success");
      router.push(campaignId ? `/campaigns/${campaignId}/ads` : "/admin/ads");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <div className="h-8 w-48 animate-skeleton rounded-lg" />
        <div className="glass rounded-2xl p-5">
          <div className="h-4 w-full animate-skeleton rounded mb-3" />
          <div className="h-4 w-2/3 animate-skeleton rounded" />
        </div>
      </div>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!validation) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={`Ad #${validation.adId}`}
        status={validation.status}
        backHref={campaignId ? `/campaigns/${campaignId}/ads` : undefined}
        backLabel="Back to campaign ads"
      />

      <Card>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {STATUS_NOTES[validation.status]}
        </p>
        {validation.inHumanReview && (
          <p className="mt-2 text-sm text-amber-600">
            An admin needs to approve or reject this ad before it can go live.
          </p>
        )}

        {isAdmin && (
          <div className="mt-4 flex gap-2">
            {validation.status === "FLAGGED" && (
              <Button loading={acting} onClick={() => {
                setActing(true);
                adsApi.reviewAd(adId, "approve").then(() => {
                  setValidation((v) => v ? { ...v, status: "AWAITING_FEATURES", inHumanReview: false } : v);
                  showToast("Ad approved", "success");
                }).catch((err) => showToast(errorMessage(err), "error")).finally(() => setActing(false));
              }}>
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
            )}
            {CAN_REJECT.has(validation.status) && (
              <Button variant="secondary" loading={acting} onClick={handleReject}>
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            )}
            {CAN_DELETE.has(validation.status) && (
              <Button variant="danger" loading={acting} onClick={() => setConfirmDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        )}

        {WAITING_STATUSES.includes(validation.status) && <ValidationTimer />}
        {validation.status === "PROCESSING" && <ProcessingSpinner />}
        {validation.status === "AWAITING_FEATURES" && (
          <div className="mt-4">
            <FeatureSelectionForm adId={adId} onSubmitted={() => loadValidation()} />
          </div>
        )}
      </Card>

      {validation.status === "LIVE" && (
        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Embed
          </p>
          {embed ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-xl bg-neutral-100 px-3 py-2 text-xs dark:bg-white/5">
                  {embed.embedUrl}
                </code>
                <Button variant="secondary" onClick={() => copy(embed.embedUrl, "Embed URL")}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <div className="flex items-start gap-2">
                <pre className="flex-1 overflow-x-auto rounded-xl bg-neutral-100 px-3 py-2 text-xs dark:bg-white/5">
                  {embed.embedSnippet}
                </pre>
                <Button
                  variant="secondary"
                  onClick={() => copy(embed.embedSnippet, "Embed snippet")}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                <iframe
                  title={`Ad #${validation.adId} embed preview`}
                  src={embed.embedUrl}
                  width="100%"
                  height={360}
                  frameBorder={0}
                  allow="autoplay; fullscreen"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Loading embed link...</p>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this ad?"
        description="This will permanently delete the ad. This action can't be undone."
        confirmLabel="Delete"
        danger
        loading={acting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

export default function AdDetailPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading ad...</p>}>
        <AdDetailContent />
      </Suspense>
    </RequireAuth>
  );
}
