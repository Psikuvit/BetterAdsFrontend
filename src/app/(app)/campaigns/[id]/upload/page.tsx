"use client";

import { SubmitEvent, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/errors";
import * as uploadApi from "@/lib/api/upload";

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

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
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

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Back to campaign
        </Link>
        <h1 className="mt-1 text-2xl font-medium text-neutral-900 dark:text-white">Upload ad</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
          />
          <Input
            label="Target locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en"
            disabled={busy}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-600 dark:text-white/70">
              Video file
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="cursor-pointer text-sm text-neutral-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-electric-blue file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-vibrant-purple disabled:opacity-50 dark:text-white/40"
            />
            <p className="text-xs text-neutral-400">MP4, WebM, MOV, or AVI — up to 200MB.</p>
          </div>

          {busy && (
            <p className="text-sm text-neutral-500">
              {STEP_LABELS[step as Exclude<Step, "idle" | "done">]}...
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={busy} className="self-start">
            Upload
          </Button>
        </form>
      </Card>
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
