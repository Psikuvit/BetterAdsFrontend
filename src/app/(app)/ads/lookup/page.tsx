"use client";

import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function AdLookupContent() {
  const router = useRouter();
  const [adId, setAdId] = useState("");
  const [locale, setLocale] = useState("");

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!adId) return;
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    router.push(`/ads/${adId}/variants${qs}`);
  }

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Ad variants</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Ad ID"
            type="number"
            required
            value={adId}
            onChange={(e) => setAdId(e.target.value)}
            placeholder="123"
          />
          <Input
            label="Locale (optional)"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en"
          />
          <Button type="submit" className="self-start">
            Look up
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdLookupPage() {
  return (
    <RequireAuth allowedRoles={["PUBLISHER", "ADVERTISER"]}>
      <AdLookupContent />
    </RequireAuth>
  );
}
