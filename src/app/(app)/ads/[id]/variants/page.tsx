"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Spinner } from "@/components/ui/Spinner";
import { errorMessage } from "@/lib/errors";
import * as linksApi from "@/lib/api/links";
import { ArrowLeft, Link2 } from "lucide-react";

function VariantsList() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const adId = Number(params.id);
  const locale = searchParams.get("locale") || undefined;

  const [variants, setVariants] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    linksApi
      .getLinks(adId, locale)
      .then(setVariants)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [adId, locale]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/ads/lookup"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Look up another ad
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Variants for ad #{adId}
          {locale ? <span className="text-muted-foreground"> ({locale})</span> : ""}
        </h1>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading variants...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : !variants || variants.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 py-12 text-center">
          <Link2 className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No variants found for this ad.</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-0">
          <ul>
            {variants.map((v, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="border-b border-border last:border-0 px-5 py-3.5"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-muted-foreground flex-shrink-0" />
                  <code className="text-sm break-all font-mono text-foreground">{v}</code>
                </div>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

export default function VariantsPage() {
  return (
    <RequireAuth allowedRoles={["PUBLISHER", "ADVERTISER"]}>
      <Suspense fallback={<div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner />Loading...</div>}>
        <VariantsList />
      </Suspense>
    </RequireAuth>
  );
}
