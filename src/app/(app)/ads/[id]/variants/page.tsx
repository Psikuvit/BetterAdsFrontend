"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { errorMessage } from "@/lib/errors";
import * as linksApi from "@/lib/api/links";

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
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <Link
          href="/ads/lookup"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Look up another ad
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
          Variants for ad #{adId}
          {locale ? ` (${locale})` : ""}
        </h1>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !variants || variants.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            illustration="search"
            title="No variants found"
            description="This ad doesn't have any variants yet."
          />
        </Card>
      ) : (
        <Card className="p-0">
          <ul>
            {variants.map((v, i) => (
              <li
                key={i}
                className="border-b border-neutral-100 px-4 py-3 text-sm last:border-0 dark:border-neutral-900"
              >
                <code className="break-all text-neutral-700 dark:text-neutral-300">{v}</code>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default function VariantsPage() {
  return (
    <RequireAuth allowedRoles={["PUBLISHER", "ADVERTISER"]}>
      <Suspense fallback={<CardSkeleton />}>
        <VariantsList />
      </Suspense>
    </RequireAuth>
  );
}
