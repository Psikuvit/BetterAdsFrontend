"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/RequireAuth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Campaign } from "@/lib/types";
import {
  Plus,
  X,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from "lucide-react";

function CampaignsContent() {
  const { showToast } = useToast();
  const { role } = useAuth();
  const canCreate = role === "ADVERTISER";
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(() => searchParams.get("new") === "1");
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback((pageToLoad: number) => {
    setLoading(true);
    campaignsApi
      .listCampaigns({ page: pageToLoad, size: 10, sort: "createdAt,desc" })
      .then((res) => {
        setCampaigns(res.content);
        setTotalPages(res.totalPages);
        setPage(res.number);
        setError("");
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    try {
      await campaignsApi.createCampaign({
        name: name || undefined,
        budget: budget || undefined,
      });
      setName("");
      setBudget("");
      setShowForm(false);
      load(0);
      showToast("Campaign created", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your advertising campaigns
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "secondary" : "primary"}>
            {showForm ? (
              <>
                <X className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="size-4" />
                New campaign
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && canCreate && (
        <GlassCard>
          <h3 className="text-sm font-medium text-foreground mb-4">Create campaign</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer promo"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button type="submit" loading={creating}>
              Create
            </Button>
          </form>
        </GlassCard>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Loading campaigns...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : campaigns.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 py-12 text-center">
          <Megaphone className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {canCreate ? "No campaigns yet." : "No campaigns to show."}
          </p>
          {canCreate && !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              Create your first campaign
            </Button>
          )}
        </GlassCard>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3.5 font-medium">Name</th>
                  <th className="px-4 py-3.5 font-medium">Status</th>
                  <th className="px-4 py-3.5 font-medium">Budget</th>
                  <th className="px-4 py-3.5 font-medium">Spent</th>
                  <th className="px-4 py-3.5 font-medium">Created</th>
                  <th className="px-4 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <Link href={`/campaigns/${c.id}`} className="font-medium hover:text-primary transition-colors">
                        {c.name || "Untitled campaign"}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 tabular-nums">${c.budget.toFixed(2)}</td>
                    <td className="px-4 py-3.5 tabular-nums">${c.spent.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <Link href={`/campaigns/${c.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="size-3.5" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/campaigns/${c.id}/upload`}>
                          <Button variant="outline" size="sm">
                            <Upload className="size-3.5" />
                            Upload ad
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {campaigns.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/campaigns/${c.id}`} className="font-medium hover:text-primary transition-colors">
                    {c.name || "Untitled campaign"}
                  </Link>
                  <Badge status={c.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="tabular-nums">${c.budget.toFixed(2)} budget</span>
                  <span className="tabular-nums">${c.spent.toFixed(2)} spent</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/campaigns/${c.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="size-3.5" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/campaigns/${c.id}/upload`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="size-3.5" />
                      Upload ad
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => load(page - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => load(page + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <Suspense fallback={<div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner />Loading campaigns...</div>}>
        <CampaignsContent />
      </Suspense>
    </RequireAuth>
  );
}
