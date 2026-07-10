"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, Search } from "lucide-react";

function AdLookupContent() {
  const router = useRouter();
  const [adId, setAdId] = useState("");
  const [locale, setLocale] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!adId) return;
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    router.push(`/ads/${adId}/variants${qs}`);
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Eye className="size-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Ad variants</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Look up variant URLs for any ad by its ID
        </p>
      </div>
      <GlassCard>
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
            <Search className="size-4" />
            Look up
          </Button>
        </form>
      </GlassCard>
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
