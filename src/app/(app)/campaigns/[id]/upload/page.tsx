"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/errors";
import * as uploadApi from "@/lib/api/upload";
import { ArrowLeft, Upload as UploadIcon, FileVideo, CheckCircle2 } from "lucide-react";

type Step = "idle" | "presigning" | "uploading" | "confirming" | "done";

const STEP_LABELS: Record<Exclude<Step, "idle" | "done">, string> = {
  presigning: "Requesting upload URL",
  uploading: "Uploading video",
  confirming: "Confirming ad",
};

function UploadContent() {
  const params = useParams<{ id: string }>();
  const campaignId = Number(params.id);
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [locale, setLocale] = useState("en");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  function validateFile(f: File): string | null {
    if (!uploadApi.ALLOWED_VIDEO_TYPES.includes(f.type)) {
      return `Unsupported file type. Allowed: ${uploadApi.ALLOWED_VIDEO_TYPES.join(", ")}`;
    }
    if (f.size > uploadApi.MAX_UPLOAD_BYTES) {
      return "File exceeds the 200MB limit.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!user) return;
    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
    const key = `ads/${user.id}/${uuid}${extension ? `.${extension}` : ""}`;

    try {
      setStep("presigning");
      const { url } = await uploadApi.presignUpload(key, file.type);

      setStep("uploading");
      await uploadApi.putToS3(url, file, file.type);

      setStep("confirming");
      const { adId } = await uploadApi.confirmUpload({
        campaignId,
        title,
        storageKey: key,
        targetLocale: locale || undefined,
      });

      setStep("done");
      router.push(`/ads/${adId}?campaignId=${campaignId}`);
    } catch (err) {
      setError(errorMessage(err));
      setStep("idle");
    }
  }

  const busy = step !== "idle" && step !== "done";

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto">
        <GlassCard glow="cyan" className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h2 className="text-lg font-semibold">Upload complete!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting to your ad...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to campaign
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Upload ad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a video ad for this campaign
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            placeholder="My awesome ad"
          />
          <Input
            label="Target locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en"
            disabled={busy}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Video file
            </label>
            <div className="relative">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                disabled={busy}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-3 rounded-md border border-input bg-card px-3 py-2.5 text-sm text-muted-foreground">
                <FileVideo className="size-5 text-primary flex-shrink-0" />
                {file ? (
                  <span className="text-foreground truncate">{file.name}</span>
                ) : (
                  <span>Choose a video file or tap to browse</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">MP4, WebM, MOV, or AVI — up to 200MB.</p>
          </div>

          {busy && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 text-sm text-primary">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {STEP_LABELS[step as Exclude<Step, "idle" | "done">]}...
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" loading={busy} className="self-start">
            <UploadIcon className="size-4" />
            Upload
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}

export default function UploadPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER"]}>
      <UploadContent />
    </RequireAuth>
  );
}
