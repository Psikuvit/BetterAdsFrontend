"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as adsApi from "@/lib/api/ads";
import { subscribeAdEvents } from "@/lib/sse";
import { AdStatus, AdValidation, EmbedLink } from "@/lib/types";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  AlertTriangle,
  XCircle,
  Code,
  ExternalLink,
} from "lucide-react";

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
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
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
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
      <span className="font-mono text-lg tabular-nums text-muted-foreground">
        {formatElapsed(seconds)}
      </span>
    </div>
  );
}

function ProcessingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Sparkles className="size-10 text-primary relative" />
      </div>
      <p className="text-sm text-muted-foreground">Processing your ad...</p>
    </div>
  );
}

function FeatureSelectionForm({ adId, onSubmitted }: { adId: number; onSubmitted: () => void }) {
  const [selected, setSelected] = useState<string[]>(["en"]);
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
    <div className="flex flex-col gap-4 mt-4">
      <p className="text-sm font-medium text-foreground">
        Translate to
      </p>
      <div className="flex flex-wrap gap-2">
        {LOCALE_OPTIONS.map((locale) => {
          const active = selected.includes(locale.code);
          return (
            <button
              key={locale.code}
              type="button"
              disabled={submitting}
              onClick={() => toggle(locale.code)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-input text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {locale.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={handleSubmit} loading={submitting} className="self-start">
        <Sparkles className="size-4" />
        Generate
      </Button>
    </div>
  );
}

function AdDetailContent() {
  const params = useParams<{ id: string }>();
  const adId = Number(params.id);
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
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
      .catch(() => {});
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

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Loading ad...
    </div>
  );
  
  if (error) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">{error}</div>
    </div>
  );
  
  if (!validation) return null;

  const statusIcon = {
    PENDING: <Clock className="size-4 text-muted-foreground" />,
    VALIDATING: <Loader2 className="size-4 animate-spin text-electric-blue" />,
    AWAITING_FEATURES: <Sparkles className="size-4 text-vibrant-purple" />,
    PROCESSING: <Sparkles className="size-4 text-electric-blue" />,
    LIVE: <CheckCircle2 className="size-4 text-success" />,
    FLAGGED: <AlertTriangle className="size-4 text-pending" />,
    REJECTED: <XCircle className="size-4 text-destructive" />,
    FAILED: <XCircle className="size-4 text-destructive" />,
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        {campaignId && (
          <Link
            href={`/campaigns/${campaignId}/ads`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to campaign ads
          </Link>
        )}
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Ad #{validation.adId}</h1>
          <Badge status={validation.status} />
        </div>
      </div>

      <GlassCard
        glow={validation.status === "LIVE" ? "cyan" : validation.status === "FLAGGED" ? "blue" : "none"}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{statusIcon[validation.status]}</div>
          <div className="flex-1">
            <p className="text-sm text-foreground">{STATUS_NOTES[validation.status]}</p>
            {validation.inHumanReview && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-pending/10 border border-pending/20 px-3 py-2 text-sm text-pending">
                <AlertTriangle className="size-4" />
                An admin needs to approve or reject this ad before it can go live.
              </div>
            )}

            {WAITING_STATUSES.includes(validation.status) && <ValidationTimer />}
            {validation.status === "PROCESSING" && <ProcessingSpinner />}
            {validation.status === "AWAITING_FEATURES" && (
              <FeatureSelectionForm adId={adId} onSubmitted={() => loadValidation()} />
            )}
          </div>
        </div>
      </GlassCard>

      {validation.status === "LIVE" && (
        <GlassCard delay={0.2}>
          <h3 className="text-sm font-medium text-foreground mb-4">Embed</h3>
          {embed ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs font-mono truncate">
                  <Code className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <code className="truncate text-foreground">{embed.embedUrl}</code>
                </div>
                <Button variant="secondary" size="sm" onClick={() => copy(embed.embedUrl, "Embed URL")}>
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
              <div className="flex items-start gap-2">
                <pre className="flex-1 overflow-x-auto rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs font-mono text-foreground">
                  {embed.embedSnippet}
                </pre>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copy(embed.embedSnippet, "Embed snippet")}
                >
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  src={embed.embedUrl}
                  width="100%"
                  height={360}
                  frameBorder={0}
                  allow="autoplay; fullscreen"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading embed link...
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

export default function AdDetailPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading ad...</div>}>
        <AdDetailContent />
      </Suspense>
    </RequireAuth>
  );
}
